import * as api from './api';
import { fetchExternalData } from './api';
import { dict, useCompute, PageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import tableSelector from '/@/components/tableSelector/index.vue';
import { shallowRef, computed } from 'vue';
import manyToMany from '/@/components/manyToMany/index.vue';
import { auth } from '/@/utils/authFunction';
import { datePickTypes } from 'element-plus';

const { compute } = useCompute();

export default function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const { tabActivted } = context; //从context中获取tabActivted

	const pageRequest = async (query: PageQuery) => {
		// 根据 tabActivted 的值调整请求参数
		if (tabActivted.value === 'uncleaned') {
		  query.status = "uncleaned"; // 添加一个参数，例如 status
		} else if (tabActivted.value === 'cleaned') {
		  query.status = "cleaned"; // 添加一个参数，例如 status
		}
		console.log(9999999991111111)
		console.log(query)
		const result = await api.GetList(query); // 将返回值存储到变量result中
		return result; // 返回数据
	};
	const editRequest = async ({ form, row }: EditReq) => {
		form.id = row.id;
		return await api.UpdateObj(form);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.DelObj(row.id);
	};
	const addRequest = async ({ form }: AddReq) => {
		return await api.AddObj(form);
	};

	const viewRequest = async ({ row }: { row: any }) => {
		return await api.GetObj(row.id);
	};

	const IsReadFunc = computed(() => {
		return tabActivted.value === 'uncleaned';
	});

	// --------------------------------
	const handleExportAll = async () => {
		try {
			console.log("----------111111111--------------");
			const queryForm = {
				business_code: 'B5100008', // 示例值，实际应从表单获取
				business_name: '高济医药（成都）有限公司' // 示例值，实际应从表单获取
			};
	
			// 调用 fetchExternalData 方法
			await fetchExternalData(queryForm);
	
			// 立即给用户一个提示
			alert('导出任务已触发，请稍后查看下载链接。');
		} catch (error) {
			console.error('导出失败:', error);
			alert('导出失败，请检查数据或联系管理员'); // 提示用户
		}
	};
	
	const convertToCsv = (data: any[]) => {
		console.log("转换前的原始数据:", data); // 调试日志
	
		if (!data || !Array.isArray(data) || data.length === 0) {
			console.warn("数据为空或非数组");
			return '';
		}
	
		try {
			const firstItem = data[0];
			if (!firstItem || typeof firstItem !== 'object') {
				throw new Error("数据项不是对象类型");
			}
	
			const headers = Object.keys(firstItem).filter(key => key !== 'children').join(',');
			console.log("CSV表头:", headers); // 调试日志
	
			const rows = data
				.filter(item => item != null)
				.map(item => {
					return headers.split(',').map(header => {
						let value = item[header];
						if (typeof value === 'object') {
							if (value.title) {
								value = value.title;
							} else {
								value = JSON.stringify(value);
							}
						}
						return `"${String(value ?? '').replace(/"/g, '""')}"`;
					}).join(',');
				})
				.join('\n');
	
			const csvContent = `${headers}\n${rows}`;
			console.log("生成的CSV内容:", csvContent); // 调试日志
			return csvContent;
		} catch (e) {
			console.error('CSV 转换失败:', e);
			return '';
		}
	};
	// -------------------------------

	return {
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
				
			},
			actionbar: {
				buttons: {
					add: {
						show: computed(() => {
							return tabActivted.value !== 'uncleaned' && auth('sales:Create');
						}),
					},
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 150,
				buttons: {
					edit: {
						show: false,
					},
					view: {
						text: '查看',
						type: 'text',
						iconRight: 'View',
						show: auth('sales:Search'),
						click({ index, row }) {
							crudExpose.openView({ index, row });
							if (tabActivted.value === 'uncleaned') {
								viewRequest({ row });
								crudExpose.doRefresh();
							}
						},
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('sales:Delete'),
					},
				},
			},
			columns: {
				customField1: {
					title: "出库时间范围",
					type: "date",
					column: {
						show:false,
					  },
					search: {
					  show: true,
					  col: {
						span: 6
					  },

					  //查询显示范围选择
					  component: {
						type: "daterange"
					  }
					},
					form: {
						component: {
						  //输入输出值格式化
						  valueFormat: "YYYY-MM-DD"
						}
					  }
					},
					// format: {
					//   title: "格式化",
					//   type: "datetime",
					//   form: {
					// 	component: {
					// 	  //显示格式化
					// 	  format: "YYYY年MM月DD日 HH:mm",
					// 	  //输入值格式
					// 	  valueFormat: "YYYY-MM-DD HH:mm:ss"
					// 	}
					//   },
					//   column: {
					// 	width: 180,
					// 	show:false,
					// 	component: {
					// 	  // 显示格式化，行展示组件使用的dayjs，
					// 	  format: "YYYY年MM月DD日 HH:mm"
					// 	}
					//   }
					// },


				business_code: {
					title: '商业编码',
					// form: {
					// 	show: true,
					// },
				},
				business_name: {
					title: '商业公司',
					search: {
						show: true,
					},
					type: ['text', 'colspan'],
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							// 表单校验规则
							{
								required: true,
								message: '必填项',
							},
						],
						component: { span: 24, placeholder: '请输入标题' },
					},
				},

				outbound_date: {
					title: '出库时间',
					search: {
						show: true,
					},
					type: ['text', 'colspan'],
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							// 表单校验规则
							{
								required: true,
								message: '必填项',
							},
						],
						component: { span: 24, placeholder: '请输入标题' },
					},
				},
				downstream_receiver_name: {
					title: '下游收货方名称',
					search: {
						show: true,
					},
					type: ['text', 'colspan'],
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							// 表单校验规则
							{
								required: true,
								message: '必填项',
							},
						],
						component: { span: 24, placeholder: '请输入标题' },
					},
				},
// -----------------
                // description: {
                //     title: '描述',
                //     search: {
                //         show: true,
                //     },
                //     type: ['text', 'colspan'],
                //     column: {
                //         minWidth: 120,
                //     },
                // },
// ---------------------
			},
			toolbar: {
				buttons: {
				// 隐藏默认导出按钮（如果有）
				export: { show: true },
				// 添加自定义导出全部按钮
				exportAll: {
					text: "导出全部数据",
					click: handleExportAll
				}
				},
			}
		},
	};
}
