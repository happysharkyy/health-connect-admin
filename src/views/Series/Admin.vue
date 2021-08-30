<template>
  <div class="page-container">
	<!--工具栏-->
	<div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
		<el-form :inline="true" :model="filters" :size="size">
			<el-form-item>
				<el-input v-model="filters.title" placeholder="合辑标题"></el-input>
			</el-form-item>
			<el-form-item>
				<kt-button icon="fa fa-search" :label="$t('action.search')" perms="series:view" type="primary" @click="findPage(null)"/>
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
	<kt-table :height="350" permsEdit="series:edit" permsDelete="series:delete"
		:data="pageResult" :columns="filterColumns"
		@findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
	</kt-table>
	<!--新增编辑界面-->
	<el-dialog :title="operation='编辑'" width="80%" :visible.sync="dialogVisible" :close-on-click-modal="false">
		<el-form :model="topic" ref="topic" class="demo-topic">
			<el-form-item prop="title">
                <el-input
                  v-model="topic.title"
                  placeholder="输入新的主题名称"
                ></el-input>
              </el-form-item>

              <!--Markdown-->
              <div id="vditor"></div>
				<div style="margin-top:10px;align:left">
				<el-tag
				:key="tag"
				v-for="tag in tags"
				closable
				:disable-transitions="false"
				@close="handleClose(tag)">
				{{tag}}
				</el-tag>


				<el-input
					class="input-new-tag"
					v-if="inputVisible"
					v-model="inputValue"
					ref="saveTagInput"
					size="small"
					@keyup.enter.native="handleInputConfirm"
					@blur="handleInputConfirm"
					>
					</el-input>
					<el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
				</div>
			<el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                accept="image/png,image/gif,image/jpg,image/jpeg"
                :before-upload="handleBeforeUpload">
                <img v-if="topic.img" :src="url+topic.img" class="avatar">
                <i v-else style="width:100px;50px" class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
              <el-form-item class="mt-3" style="margin-top:10px">
                <el-button type="primary" @click="handleUpdate()"
                  >更新
                </el-button>
                <el-button @click="resetForm('topic')">重置</el-button>
              </el-form-item>
		</el-form>
		<!-- <div slot="footer" class="dialog-footer">
			<el-button :size="size" @click.native="dialogVisible = false">{{$t('action.cancel')}}</el-button>
			<el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>
		</div> -->
	</el-dialog>
  </div>
</template>                                                                                                                                                                 

<script>
import { baseUrl } from '@/utils/global'
import PopupTreeInput from "@/components/PopupTreeInput"
import KtTable from "@/views/Core/KtTable"
import KtButton from "@/views/Core/KtButton"
import TableColumnFilterDialog from "@/views/Core/TableColumnFilterDialog"
import { format } from "@/utils/datetime"
import Vditor from 'vditor'
import 'vditor/dist/index.css'

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
			columns: [], inputVisible: false,
        	inputValue: '',
			filterColumns: [],
			pageRequest: { pageNum: 1, pageSize: 10 },
			pageResult: {},

			operation: false, // true:新增, false:编辑
			dialogVisible: false, // 新增编辑界面是否显示
			editLoading: false,
	
			// 新增编辑界面数据
			topic: {
				title: '',
			},
			title: '', // 标题
      		tags: [],
			content: []
		}
	},
	created() {
        this.url = baseUrl
  	},
	methods: {
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
      upload(fd).then(res => {
          console.log(res)
          this.ruleForm.img = res.data
              this.$notify.success({
              title: 'Info',
              message: '封面上传成功!',
              duration: 3000
          });
      })
    },
		handleClose(tag) {
		var that=this;
        that.tags.splice(that.tags.indexOf(tag), 1);
      },

		showInput() {
			this.inputVisible = true;
			this.$nextTick(_ => {
			this.$refs.saveTagInput.$refs.input.focus();
			});
		},

		handleInputConfirm() {
			let inputValue = this.inputValue;
			if (inputValue) {
				this.tags.push(inputValue);
				console.log(this.tags)
			}
			this.inputVisible = false;
			this.inputValue = '';
		}
		,
		 renderMarkdown(md) {
			this.contentEditor = new Vditor("vditor", {
				height: 460,
				placeholder: "输入要更新的内容",
				preview: {
				hljs: { style: "monokai" },
				},
				mode: "wysiwyg",
				after: () => {
				this.contentEditor.setValue(md);
				},
			});
			},
		fetchTopic(id) {

			this.$api.series.getTopic(id).then((value) => {
				this.topic = value.data.topic;
				console.log(this.topic)
				this.tags = value.data.tags.map(tag => tag.name);
				this.renderMarkdown(this.topic.content);
			});
			},
			handleUpdate: function () {
							
			console.log(this.tags)
			this.$api.series.save(this.tags,this.topic.id).then((res) => {
				console.log(res)
			});
			
			this.topic.content = this.contentEditor.getValue();
			this.$api.series.save(this.topic).then((res) => {
				this.editLoading = false
				if(res.code == 200) {
					this.$message({ message: '操作成功', type: 'success' })
					this.dialogVisible = false
					this.$refs['topic'].resetFields()
				} else {
					this.$message({message: '操作失败, ' + res.msg, type: 'error'})
				}
				this.findPage(null)
			});
			},

			resetForm(formName) {
			this.$refs[formName].resetFields();
			this.contentEditor.setValue("");
			this.tags = "";
			},
		
		// 获取分页数据
		findPage: function (data) {
			if(data !== null) {
				this.pageRequest = data.pageRequest
			}
			this.pageRequest.columnFilters = {name: {name:'title', value:this.filters.title}}
			console.log(this.pageRequest.columnFilters)
			this.$api.series.findPage(this.pageRequest).then((res) => {
				this.pageResult = res.data
				//this.findUserRoles()
			}).then(data!=null?data.callback:'')
		},

		// 批量删除
		handleDelete: function (data) {
			this.$api.user.batchDelete(data.params).then(data!=null?data.callback:'')
		},
		// 显示编辑界面
		handleEdit: function (params) {
			this.dialogVisible = true
			this.operation = false
			this.fetchTopic(params.row.id);
		},
		// 编辑
		submitForm: function () {
			this.$refs.topic.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.topic)
						console.log(params)
						this.$api.series.save(params).then((res) => {
							this.editLoading = false
							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
								this.dialogVisible = false
								this.$refs['topic'].resetFields()
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
				{prop:"id", label:"合辑ID", minWidth:70},
				{prop:"title", label:"标题", minWidth:70},
				{prop:"userId", label:"用户ID", minWidth:90},
				{prop:"createTime", label:"创建时间", minWidth:120},
                {prop:"img", label:"封面图片存放位置", minWidth:150}
				// {prop:"createBy", label:"创建人", minWidth:120},
				// {prop:"createTime", label:"创建时间", minWidth:120, formatter:this.dateFormat}
				// {prop:"lastUpdateBy", label:"更新人", minWidth:100},
				// {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
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
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>