<template>
  <div class="container-box flex1 flex-column task-temple">
    <div class="search-area">
      <el-form :model="searchForm"
               inline
               ref="searchForm">
        <el-form-item label="流程名称"
                      label-width="78px">
          <el-input v-model="searchForm.name"
                    autocomplete="off"
                    class="big"
                    placeholder="查询流程名称"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="活动类型"
                      label-width="78px">
          <el-input v-model="searchForm.code"
                    class="small"
                    clearable></el-input>
        </el-form-item>
        <!--<el-form-item label="归属部门"-->
                      <!--label-width="78px">-->
          <!--<div class="small">-->
            <!--<choose-department :disabledRoot="true"-->
                               <!--:current-id="searchForm.id"-->
                               <!--:chooseData="organizationData"-->
                               <!--@choose="chooseOrg"-->
                               <!--org-key="organization"></choose-department>-->
          <!--</div>-->
        <!--</el-form-item>-->
        <el-form-item label="业务角色"
                      label-width="78px">
          <el-input v-model="searchForm.code"
                    autocomplete="off"
                    class="small"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="岗位"
                      label-width="55px">
          <el-input v-model="searchForm.code"
                    autocomplete="off"
                    class="small"
                    clearable></el-input>
        </el-form-item>
      </el-form>
      <div class="btns-box">
        <el-button type="primary"
                   size="mini"
                   @click="searchQuery">查询</el-button>
        <el-button type="primary"
                   size="mini"
                   @click="bubbleEvent('goToAddTask')">新建/编辑</el-button>
      </div>

    </div>
    <mainTablePageEle ref="thetable"
                      class="main-table"
                      v-loading="loading"
                      :table-data="tableData"
                      :total="total"
                      :pageIndex="pageInfo.__page"
                      :pageSize="pageInfo.__pagesize"
                      layout="total, prev, pager, next"
                      @page-change="pageChangeHandler">
      <el-table-column type="index"
                       label="序号"
                       width="80"></el-table-column>
      <el-table-column prop="shortName"
                       label="活动编码"
                       show-overflow-tooltip></el-table-column>
      <el-table-column prop="name"
                       label="活动名称"
                       show-overflow-tooltip></el-table-column>
      <el-table-column prop="description"
                       label="活动类型"></el-table-column>
      <el-table-column prop="description"
                       label="描述"
                       show-overflow-tooltip></el-table-column>
      <el-table-column label="业务角色">
        <template slot-scope="scope">
          {{statusMap[scope.row.status]}}
        </template>
      </el-table-column>
      <el-table-column prop="description"
                       label="责任部门"></el-table-column>
    </mainTablePageEle>
    <div>
      <el-button size="medium"
                 @click="searchQuery">取消</el-button>
      <el-button size="medium"
                 type="primary"
                 @click="searchQuery">选择并引用</el-button>
    </div>
  </div>
</template>

<script>
// import ChooseDepartment from '@/components/ChooseModel'
// import { basicData as API } from '@/service'

export default {
  name: 'refTask',
  data () {
    return {
      searchForm: {
        name: ''
      },
      organizationData: [],
      tableData: [],
      pageInfo: {
        __page: 1,
        __pagesize: null
      },
      total: 0,
      loading: false,
      statusData: [
        { value: 'active', label: '可用' },
        { value: 'Inactive', label: '不可用' }
      ],
      statusMap: {
        active: '可用',
        Inactive: '不可用'
      }
    }
  },
  // components: { ChooseDepartment },
  created () {
    this.pageInfo.__pagesize = this.pageSizeInit
    // this.getdata()
  },
  computed: {},
  methods: {
    getdata () {
      this.loading = true
      const params = Object.assign({}, this.searchForm, this.pageInfo)
      API.getAppList(params).then(res => {
        this.loading = false
        this.tableData = res.data
        this.total = res.__pagecount
      })
    },
    pageChangeHandler (params) {
      this.pageInfo.__page = params.page
      this.pageInfo.__pagesize = params.pagesize
      this.getdata()
    },
    searchQuery () {
      this.pageInfo.__page = 1
      // this.getdata()
    },
    bubbleEvent (type, params) {
      this.$emit('bubbleEvent', type, params)
    },
    // 选中岗位
    chooseOrg (params) {
      console.log(params)
      this.searchForm[params.key + 'Id'] = params.data[0].id
      this.searchForm[params.key + 'Name'] = params.data[0].name
      this[params.key + 'Data'] = params.data
    }
  }
}
</script>
