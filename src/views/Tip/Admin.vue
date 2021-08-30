<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.title" placeholder="内容名称"></el-input>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-search" :label="$t('action.search')" perms="tip:view" type="primary" @click="findPage(null)"/>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-plus" :label="$t('action.add')" perms="tip:add" type="primary" @click="handleAdd" />
			</el-form-item>
		</el-form>
	</div>
	<div class="toolbar" style="float:right;padding-top:10px;padding-right:15px;">
		<el-form :inline="true" :size="size">
			<el-form-item>
				<el-button-group>
				<el-tooltip content="刷新" placement="top">
					<el-button icon="fa fa-refresh" @click="findPage(null)"></el-button>
				</el-tooltip>
				<el-tooltip content="列显示" placement="top">
					<el-button icon="fa fa-filter" @click="displayFilterColumnsDialog"></el-button>
				</el-tooltip>
				<el-tooltip content="导出" placement="top">
					<el-button icon="fa fa-file-excel-o"></el-button>
				</el-tooltip>
				</el-button-group>
			</el-form-item>
		</el-form>
		<!--表格显示列界面-->
		<table-column-filter-dialog ref="tableColumnFilterDialog" :columns="columns" 
			@handleFilterColumns="handleFilterColumns"> 
		</table-column-filter-dialog>
	</div>
	<!--表格内容栏-->
	<kt-table :height="350" permsEdit="tip:edit" permsDelete="tip:delete"
		:data="pageResult" :columns="filterColumns"
		@findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
	</kt-table>
	<!--新增编辑界面-->
	<el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
		<el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
			label-position="right">
            <el-form-item label="ID" prop="id" >
				<el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="内容" prop="content">
				<el-input v-model="dataForm.content"  auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="作者" prop="author">
				<el-input v-model="dataForm.author " auto-complete="off"></el-input>
			</el-form-item>
		
		</el-form>
		<div slot="footer" class="dialog-footer">
			<el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
			<el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
		</div>
	</el-dialog>
  </div>
</template>

<script>
import PopupTreeInput from "@/components/PopupTreeInput"
import KtTable from "@/views/Core/KtTable"
import KtButton from "@/views/Core/KtButton"
import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
import { format } from "@/utils/datetime"
export default {
	components:{
		PopupTreeInput,
		KtTable,
		KtButton,
		TableColumnFilterDialog
	},
	data() {
		return {
			size: 'small',
			filters: {
				content: ''
			},
			columns: [],
			filterColumns: [],
			pageRequest: { pageNum: 1, pageSize: 10 },
			pageResult: {},

			operation: false, // true:新增, false:编辑
			dialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
			dataFormRules: {
				content: [
					{ required: true, message: '请输入内容', trigger: 'blur' }
				]
			},
			// 新增编辑界面数据
			dataForm: {
				id: 0,
				content: '',
				author: '佚名',
			}
		}
	},
	methods: {
		// 获取分页数据
		findPage: function (data) {
			console.log(this.filters)
			if(data !== null) {
				this.pageRequest = data.pageRequest
			}
			this.pageRequest.columnFilters = {name: {name:'content', value:this.filters.content}}
			console.log(this.pageRequest.columnFilters)
			this.$api.tip.findPage(this.pageRequest).then((res) => {
				this.pageResult = res.data
                console.log(res)
			}).then(data!=null?data.callback:'')
		},
		// 批量删除
		handleDelete: function (data) {
			this.$api.tip.batchDelete(data.params).then(data!=null?data.callback:'')
		},
		// 显示新增界面
		handleAdd: function () {
			this.dialogVisible = true
			this.operation = false
			this.dataForm = {
				id: 0,
				content: '',
				author: ''
			}
		},
		// 显示编辑界面
		handleEdit: function (params) {	
			this.dialogVisible = true
			this.operation = false
			this.dataForm = Object.assign({}, params.row)
			this.dataForm.roleId = this.dataForm.roleId
			console.log(this.dataForm)
		
		},
		// 编辑
		submitForm: function () {
			this.$refs.dataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.dataForm)
						console.log(params)
						this.$api.tip.save(params).then((res) => {
							this.editLoading = false
							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
								this.dialogVisible = false
								this.$refs['dataForm'].resetFields()
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.findPage(null)
						})
					})
				}
			})
		},

		// 时间格式化
      	dateFormat: function (row, column, cellValue, index){
          	return format(row[column.property])
      	},
		// 处理表格列过滤显示
      	displayFilterColumnsDialog: function () {
			this.$refs.tableColumnFilterDialog.setDialogVisible(true)
      	},
		// 处理表格列过滤显示
      	handleFilterColumns: function (data) {
			this.filterColumns = data.filterColumns
			this.$refs.tableColumnFilterDialog.setDialogVisible(false)
      	},
		// 处理表格列过滤显示
      	initColumns: function () {
			this.columns = [
				{prop:"id", label:"ID", minWidth:70},
				{prop:"content", label:"内容", minWidth:180},
				{prop:"author", label:"作者", minWidth:70}
			]
			this.filterColumns = JSON.parse(JSON.stringify(this.columns));
      	}
	},
	mounted() {
		this.initColumns()
	}
}
</script>

<style scoped>

</style>