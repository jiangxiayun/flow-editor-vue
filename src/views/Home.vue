<template>
  <div class="wrapper full">
    <div class="subheader">
      <div class="fixed-container">
        <div class="btn-group pull-right">
          <button type="button" class="btn btn-default"
                  @click="dialogCreateVisible=true">{{$t('PROCESS-LIST.ACTION.CREATE')}}
          </button>
          <button type="button" class="btn btn-default">{{$t('PROCESS-LIST.ACTION.IMPORT')}}
          </button>
        </div>
        <h2>{{$t('PROCESS-LIST.TITLE')}}</h2>
      </div>
    </div>

    <div class="container-fluid content" auto-height offset="40">
      <div class="col-xs-2 filter-wrapper">
        <div class="input-group">
          <span class="input-group-addon"> <i class="glyphicon glyphicon-search"></i></span>
          <input type="text" v-model="model.pendingFilterText" class="form-control"
                 @change="filterDelayed"
                 :placeholder="$t('PROCESS-LIST.SEARCH-PLACEHOLDER')">
        </div>
        <ul class="filter-list">
          <li v-for="filter in model.filters"
              :key="filter.id"
              :class="{'current': filter.id == model.activeFilter.id}">
            <a @click="activateFilter(filter)">
              {{$t('PROCESS-LIST.FILTER.'+filter.labelKey)}}
            </a>
          </li>
        </ul>
      </div>

      <div class="col-xs-10 item-wrapper" id="list-items">
        <div class="dropdown-subtle pull-right">
          <div class="btn-group btn-group-sm" activiti-fix-dropdown-bug>
            <button type="button" class="btn btn-default dropdown-toggle"
                    data-toggle="dropdown">
              {{$t('PROCESS-LIST.SORT.' + model.activeSort.labelKey)}}
              <i class="caret"></i>
            </button>
            <ul class="dropdown-menu pull-right">
              <li v-for="sort in model.sorts" :key="sort.labelKey">
                <a @click="activateSort(sort)">
                  {{$t('PROCESS-LIST.SORT.' + sort.labelKey)}}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="message clearfix">
          <div class="loading pull-left" v-show="model.loading">
            <div class="l1"></div>
            <div class="l2"></div>
            <div class="l2"></div>
          </div>
          <div v-if="!model.loading">
            <span v-if="processesList.size > 1">
              {{$t('PROCESS-LIST.FILTER.' + model.activeFilter.labelKey + '-COUNT', {length:processesList.size})}}</span>
            <span v-if="processesList.size == 1">
              {{$t('PROCESS-LIST.FILTER.' + model.activeFilter.labelKey + '-ONE')}}
            </span>
            <span v-if="processesList.size > 0 && model.filterText !='' && model.filterText !== undefined">
              {{$t('PROCESS-LIST.FILTER.FILTER-TEXT', {translate:model})}}
            </span>
            <span v-if="processesList.size && model.filterText !='' && model.filterText !== undefined">
              {{$t('PROCESS-LIST.FILTER.FILTER-TEXT-EMPTY', {translate:model})}}
            </span>
          </div>
        </div>

        <div class="help-container fixed"
             v-if="processesList.size == 0 && (!model.filterText || model.filterText == '')">
          <div>
            <div class="help-text wide">
              <div class="description">
                {{$t('PROCESS-LIST.FILTER.PROCESSES-EMPTY')}}
              </div>
              <div class="help-entry" @click="dialogCreateVisible=true">
                <span class="glyphicon glyphicon-plus-sign"></span>
                <span translate="PROCESS-LIST.FILTER.PROCESSES-BPMN-HINT"></span>
                <br>
              </div>
              <div class="help-entry">
                <span class="glyphicon glyphicon-plus-sign"></span>
                <span translate="PROCESS-LIST.FILTER.PROCESSES-BPMN-IMPORT-HINT"></span>
                <br>
              </div>
            </div>
          </div>
        </div>
        <div class="item fadein" v-for="(process, index) in processesList.data" :key="index">
          <div class="item-box"
               :style="{'background-image': 'url(\'' + getModelThumbnailUrl(process.id, imageVersion) + '\')'}"
               @click="showProcessDetails(process)">
            <div class="actions">
              <span class="badge">v{{process.version}}</span>
              <div class="btn-group pull-right">
                <button id="detailsButton" type="button"
                        @click.stop="showProcessDetails(process)"
                        class="btn btn-default"
                        :title="$t('PROCESS.ACTION.DETAILS')">
                  <i class="glyphicon glyphicon-search"></i>
                </button>
                <button id="editButton" type="button"
                        @click.stop="editProcessDetails(process)"
                        class="btn btn-default"
                        :title="$t('PROCESS.ACTION.OPEN-IN-EDITOR')">
                  <i class="glyphicon glyphicon-edit"></i>
                </button>
              </div>
            </div>
            <div class="details">
              <h3 class="truncate" :title="process.name">
                {{process.name}}
              </h3>
              <div class="basic-details truncate">
                <span><i class="glyphicon glyphicon-user"></i> {{process.createdBy}}</span>
                <span :title="process.lastUpdated | dateformat('LLLL')">
                  <i class="glyphicon glyphicon-pencil"></i>
                  {{process.lastUpdated | dateformat}}
                </span>
              </div>
              <p>{{process.description}}</p>
            </div>
          </div>
        </div>

        <div class="show-more" v-if="processesList.data.length < processesList.total">
          <a>{{$t('PROCESSES-LIST.ACTION.SHOW-MORE')}}</a>
        </div>
      </div>
    </div>
    <processCreate :visible="dialogCreateVisible"></processCreate>
  </div>
</template>

<script>
  import processCreate from '@/components/popup/process-create'
  import APIS from '@/service'

  export default {
    name: 'Editor',
    data () {
      return {
        dialogCreateVisible: false,
        formItems: {},
        imageVersion: Date.now(),   // get latest thumbnails
        model: {
          filters: [
            { id: 'processes', labelKey: 'PROCESSES' }
          ],
          sorts: [
            { id: 'modifiedDesc', labelKey: 'MODIFIED-DESC' },
            { id: 'modifiedAsc', labelKey: 'MODIFIED-ASC' },
            { id: 'nameAsc', labelKey: 'NAME-ASC' },
            { id: 'nameDesc', labelKey: 'NAME-DESC' }
          ],
          activeFilter: {},
          activeSort: {}
        },
        processesList: {
          data: []
        }
      }
    },
    components: { processCreate },
    created () {},
    computed: {},
    mounted () {
      // Main page (needed for visual indicator of current page)
      // this.setMainPageById('processes')
      if (this.modelFilter) {
        this.model.activeFilter = this.modelFilter.filter
        this.model.activeSort = this.modelFilter.sort
        this.model.filterText = this.modelFilter.filterText
      } else {
        // By default, show first filter and use first sort
        this.model.activeFilter = this.model.filters[0]
        this.model.activeSort = this.model.sorts[0]
        this.modelFilter = {
          filter: this.model.activeFilter,
          sort: this.model.activeSort,
          filterText: ''
        }
      }

      // Finally, load initial processes
      this.loadProcesses()
    },
    methods: {
      setMainPageById (mainPageId) {
        for (let i = 0; i < this.mainNavigation.length; i++) {
          if (mainPageId == this.mainNavigation[i].id) {
            this.mainPage = this.mainNavigation[i]
            break
          }
        }
      },
      // getList () {
      //   API.processessList({
      //     filter: 'processes',
      //     modelType: 0,
      //     sort: 'sort',
      //   }).then(res => {
      //     console.log('res', res)
      //     this.model.processes = data
      //     this.model.loading = false
      //   }).catch((err) => {
      //     console.log('Something went wrong: ' + data)
      //     this.model.loading = false
      //   })
      // },
      activateFilter (filter) {
        this.model.activeFilter = filter
        this.modelFilter.filter = filter
        this.loadProcesses()
      },
      activateSort (sort) {
        this.model.activeSort = sort
        this.modelFilter.sort = sort
        this.loadProcesses()
      },
      loadProcesses () {
        this.model.loading = true
        let params = {
          filter: this.model.activeFilter.id,
          sort: this.model.activeSort.id,
          modelType: 0
        }
        if (this.model.filterText && this.model.filterText != '') {
          params.filterText = this.model.filterText
        }
        // {
        //   filter: 'processes',
        //     modelType: 0,
        //   sort: 'sort',
        // }
        APIS.processessList(params).then(res => {
          console.log('res', res)
          this.processesList = res
          this.model.loading = false
        }).catch((err) => {
          console.log('Something went wrong: ' + err)
          this.model.loading = false
        })
      },
      timeoutFilter () {
        this.model.isFilterDelayed = true
        this.$nextTick(() => {
          this.model.isFilterDelayed = false
          if (this.model.isFilterUpdated) {
            this.model.isFilterUpdated = false
            this.timeoutFilter()
          } else {
            this.model.filterText = this.model.pendingFilterText
            this.modelFilter.filterText = this.model.filterText
            this.loadProcesses()
          }
        })
      },
      filterDelayed () {
        if (this.model.isFilterDelayed) {
          this.model.isFilterUpdated = true
        } else {
          this.timeoutFilter()
        }
      },
      showProcessDetails (process) {
        if (process) {
          this.editorHistory = []
          this.$router.push('/processes/' + process.id)
        }
      },
      editProcessDetails (process) {
        if (process) {
          this.editorHistory = []
          this.$router.push('/design/' + process.id)
        }
      }
    }
  }
</script>
<style lang="scss">

</style>
