<template>
  <div id="main" class="wrapper full clearfix" style="height:800px">
    <div>
      <!--头部操作按钮-->
      <toolbar :editor="editor" :editorManager="editorManager"></toolbar>

      <div class="full">
        <div class="row row-no-gutter">
          <!--<paletteWrapper></paletteWrapper>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import toolbar from '@/components/flowable/toolbar'
  import paletteWrapper from '@/components/flowable/paletteHelpWrapper'
  // import ORYX from '@/flowable/editor-app/editor/oryx.debug.js'
  // import { ACTIVITI, KISBPM } from '@/assets/flowable/_config.js'
  import { AA } from './editorAA.js'

  export default {
    name: 'Editor',
    data () {
      return {
        editorManager: null,
        editor: null,
        restRootUrl: FLOWABLE.CONFIG.contextRoot,
        mainNavigation: [
          {
            'id': 'processes',
            'title': 'GENERAL.NAVIGATION.PROCESSES',
            'path': '/processes'
          },
          {
            'id': 'casemodels',
            'title': 'GENERAL.NAVIGATION.CASEMODELS',
            'path': '/casemodels'
          },
          {
            'id': 'forms',
            'title': 'GENERAL.NAVIGATION.FORMS',
            'path': '/forms'
          },
          {
            'id': 'decision-tables',
            'title': 'GENERAL.NAVIGATION.DECISION-TABLES',
            'path': '/decision-tables'
          },
          {
            'id': 'apps',
            'title': 'GENERAL.NAVIGATION.APPS',
            'path': '/apps'
          }
        ],
        config: FLOWABLE.CONFIG,
        // mainPage: this.mainNavigation[0],
        getModelThumbnailUrl: FLOWABLE.APP_URL.getModelThumbnailUrl,
        getImageUrl: FLOWABLE.APP_URL.getImageUrl,
        editorHistory: []
      }
    },
    components: { toolbar, paletteWrapper },
    created () {
      this.editorManager =  this.createEditorManager()
      this.editorManager.setModelData(this.mockData)

      var baseUrl = "http://b3mn.org/stencilset/";
      this.editorManager.setStencilData(AA);
      var stencilSet = new ORYX.Core.StencilSet.StencilSet(baseUrl, AA);
      ORYX.Core.StencilSet.loadStencilSet(baseUrl, stencilSet, '80646b68-3967-11e9-bbaa-82ad27eff10d');
      jQuery.ajax({
        type: "GET",
        url: 'flowable/editor-app/plugins.xml',
        success: function(data, textStatus, jqXHR){
          ORYX._loadPlugins(data)
        }
      });
      console.log('editorManager', this.editorManager)
      this.editorManager.bootEditor();
    },
    mounted () {

    },
    methods: {
      fetchModel() {
      }
    }
  }
</script>
<style lang="scss">
  @import "./flow.scss";
</style>
