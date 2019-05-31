<template>
  <div>
    <mainTablePageEle
        ref="thetable"
        class="main-table"
        v-loading="loading"
        :table-data="tableData"
        :paginationShow="false">
      <el-table-column label="活动序号" prop="resourceId">
      </el-table-column>
      <el-table-column
          label="活动编码">
        <template slot-scope="scope">
          <router-link to="/">{{scope.row.properties.code}}</router-link>
        </template>
      </el-table-column>
      <el-table-column
          label="活动名称"
          prop="properties.name">
      </el-table-column>
      <!--<el-table-column-->
      <!--label="活动描述"-->
      <!--prop="properties.documentation">-->
      <!--</el-table-column>-->
      <el-table-column
          label="输入"
          prop="properties.input">
      </el-table-column>
      <el-table-column
          label="输出"
          prop="properties.output">
      </el-table-column>
      <el-table-column
          label="业务角色"
          prop="properties.roleId">
      </el-table-column>
      <el-table-column
          label="归属部门"
          prop="properties.organization">
      </el-table-column>
      <!--<el-table-column-->
      <!--label="标准规范/条款"-->
      <!--prop="properties.documentation">-->
      <!--</el-table-column>-->
      <!--<el-table-column-->
      <!--label="附件/单据"-->
      <!--prop="properties.documentation">-->
      <!--</el-table-column>-->
      <!--<el-table-column-->
      <!--label="流程指标"-->
      <!--prop="properties.documentation">-->
      <!--</el-table-column>-->
      <!--<el-table-column-->
      <!--label="风控点"-->
      <!--prop="properties.documentation">-->
      <!--</el-table-column>-->
      <el-table-column
          label="时间（天）"
          prop="properties.dates">
      </el-table-column>
      <el-table-column
          label="落地系统"
          prop="properties.providerSystem">
      </el-table-column>
      <el-table-column
          label="是否KCP"
          prop="properties.kcpFlag">
      </el-table-column>
    </mainTablePageEle>
  </div>
</template>

<script>

export default {
  name: 'propertySection',
  data () {
    return {
      loading: false
    }
  },
  props: {
    modelData: Object
  },
  computed: {
    tableData () {
      if (!this.modelData.childShapes) return []
      return this.modelData.childShapes.filter(shape => shape.stencil.id === 'UserTask')
    }
  }
}
</script>

<style scoped>

</style>
