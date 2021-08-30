<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.title" placeholder="活动名称"></el-input>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-search" :label="$t('action.search')" perms="activity:view" type="primary" @click="findPage(null)"/>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-plus" :label="$t('action.add')" perms="activity:add" type="primary" @click="handleAdd" />
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
	<kt-table :height="350" permsEdit="activity:edit" permsDelete="activity:delete"
		:data="pageResult" :columns="filterColumns"
		@findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
	</kt-table>
	<!--新增编辑界面-->
	<el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
		<el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
			label-position="right">
            <el-form-item label="ID" prop="id" v-if="false">
				<el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="标题" prop="title">
				<el-input v-model="dataForm.title"  auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="内容" prop="name">
				<el-input v-model="dataForm.name " auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="库存" prop="stock">
				<el-input v-model="dataForm.stock " auto-complete="off"></el-input>
			</el-form-item>
            <el-form-item label="封面链接" prop="pic">
				<el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                accept="image/png,image/gif,image/jpg,image/jpeg"
                :before-upload="handleBeforeUpload">
                <img v-if="dataForm.pic" :src="url+dataForm.pic" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
			</el-form-item>
			<el-form-item label="开始时间" prop="startTime">
				<el-date-picker
					:disabled="operation"
					v-model="dataForm.startTime"
					type="datetime"
					placeholder="选择日期时间">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="结束时间" prop="endTime">
				<el-date-picker
					v-model="dataForm.endTime"
					type="datetime"
					placeholder="选择日期时间">
				</el-date-picker>
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
import { baseUrl } from '@/utils/global'
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
				title: ''
			},
			url:'',
			columns: [],
			filterColumns: [],
			pageRequest: { pageNum: 1, pageSize: 10 },
			pageResult: {},

			operation: false, // true:新增, false:编辑
			dialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
			dataFormRules: {
				title: [
					{ required: true, message: '请输入标题', trigger: 'blur' }
				]
			},
			// 新增编辑界面数据
			dataForm: {
				id: 0,
				title: '',
				name: '',
				pic: '',
				stock:0,
				startTime: '',
				endTime: ''
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
			this.pageRequest.columnFilters = {name: {name:'title', value:this.filters.title}}
			console.log(this.pageRequest.columnFilters)
			this.$api.activity.findPage(this.pageRequest).then((res) => {
				this.pageResult = res.data
                console.log(res)
			}).then(data!=null?data.callback:'')
		},
		// 批量删除
		handleDelete: function (data) {
			this.$api.activity.batchDelete(data.params).then(data!=null?data.callback:'')
		},
		// 显示新增界面
		handleAdd: function () {
			this.dialogVisible = true
			this.operation = false
			this.dataForm= {
				id: 0,
				title: '',
				name: '',
				pic: '',
				stock:0,
				startTime: '',
				endTime: ''
			}
		},
		 handleBeforeUpload (file) {
			if (!(file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
				this.$notify.warning({
				title: '警告',
				message: '请上传格式为image/png, image/gif, image/jpg, image/jpeg的图片'
				})
			}
			let size = file.size / 1024 / 1024 / 2
			if (size > 2) {
				this.$notify.warning({
				title: '警告',
				message: '图片大小必须小于2M'
				})
			}
			let fd = new FormData();//通过form数据格式来传
			fd.append("picFile", file); //传文件
			this.$api.upload.upload(fd).then(res => {
				console.log(res)
				this.dataForm.pic = res.data
					this.$notify.success({
					title: 'Info',
					message: '封面上传成功!',
					duration: 3000
				});
			})
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
						this.$api.activity.save(params).then((res) => {
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
				{prop:"id", label:"ID", minWidth:20},
				{prop:"title", label:"标题", minWidth:70},
				{prop:"stock", label:"剩余名额", minWidth:30},
				{prop:"startTime", label:"活动开始时间", minWidth:100},
                {prop:"endTime", label:"活动结束时间", minWidth:100},
                {prop:"createUser", label:"创建人id", minWidth:90}
			]
			this.filterColumns = JSON.parse(JSON.stringify(this.columns));
      	}
	},
	created() {
        this.url = baseUrl
  	},
	mounted() {
		this.initColumns()
	}
}
</script>

<style scoped>
  .avatar {
    width: 100px;
    height: 100px;
    display: block;
  }
</style>