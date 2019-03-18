<template>
  <div id="main" class="wrapper full clearfix">
    <!--头部操作按钮-->
    <toolbar :editor="editor" :editorManager="editorManager"></toolbar>
    <div class="full" style="height: calc(100% - 60px);">
      <div class="row row-no-gutter full-height">
        <paletteWrapper :editorManager="editorManager"></paletteWrapper>
        <div id="contentCanvasWrapper" :class="{collapsedCanvasWrapper: !paletteWrapperOpen}">
          <div id="paletteSectionOpen" :class="{hidden: paletteWrapperOpen}"
               @click="UPDATE_paletteWrapperOpen(true)">
            <i class="glyphicon glyphicon-chevron-right"></i>
          </div>
          <canvasWrapper :editorManager="editorManager"></canvasWrapper>
          <propertySection :editorManager="editorManager"></propertySection>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import toolbar from '@/components/flowable/toolbar'
  import paletteWrapper from '@/components/flowable/paletteHelpWrapper'
  import canvasWrapper from '@/components/flowable/canvasWrapper'
  import propertySection from '@/components/flowable/propertySection'
  import EditorManager from '@/assets/flowable/EditorManager'

  import APIS from '@/service'

  export default {
    name: 'Editor',
    data () {
      return {
        editorManager: null,
        // formItems: null,
        editor: null,
        // restRootUrl: FLOWABLE.CONFIG.contextRoot,
        // config: FLOWABLE.CONFIG,
        // getModelThumbnailUrl: FLOWABLE.APP_URL.getModelThumbnailUrl,
        // getImageUrl: FLOWABLE.APP_URL.getImageUrl,
        editorHistory: [],
        undoStack: [],
        redoStack: [],
        forceSelectionRefresh: false
      }
    },
    props: {
      config: {
        type: Object
      }
    },
    components: { toolbar, paletteWrapper, canvasWrapper, propertySection },
    created () {},
    computed: {
      ...mapState('Flowable', ['paletteWrapperOpen'])
    },
    mounted () {
      // this.getJson()
      this.editorManager =  new EditorManager({
        ...this.config,
      })

      // this.UPDATE_modelData(this.config.modelData)
      this.resizeFun()
    },
    methods: {
      ...mapMutations('Flowable', ['UPDATE_paletteWrapperOpen', 'UPDATE_modelData']),
      getJson () {
        let id = this.$route.params.id
        APIS.editorJson(id, {}).then(res => {
          // this.modelData = res
          this.editorManager =  new EditorManager({
            ...this.config,
            modelData: res
          })
        }).catch((err) => {
          console.log('Something went wrong: ' + err)
        })
      },
      resizeFun() {
        jQuery(window).resize(() => {
          // Calculate the offset based on the bottom of the module header
          var offset = jQuery("#editor-header").offset();
          var propSectionHeight = jQuery('#propertySection').height();
          var canvas = jQuery('#canvasSection');
          var mainHeader = jQuery('#main-header');

          if (offset == undefined || offset === null
            || propSectionHeight === undefined || propSectionHeight === null
            || canvas === undefined || canvas === null || mainHeader === null) {
            return;
          }

          if (this.editor) {
            var selectedElements = this.editorManager.getSelection();
            var subSelectionElements = this.editorManager.getSelection();

            this.selectedElements = selectedElements;
            this.subSelectionElements = subSelectionElements;
            if (selectedElements && selectedElements.length > 0) {
              this.selectedElementBeforeScrolling = selectedElements[0];

              this.editorManager.setSelection([]); // needed cause it checks for element changes and does nothing if the elements are the same
              this.editorManager.setSelection(this.selectedElements, this.subSelectionElements);
              this.selectedElements = undefined;
              this.subSelectionElements = undefined;
            }
          }

          var totalAvailable = jQuery(window).height() - offset.top - mainHeader.height() - 21;
          canvas.height(totalAvailable - propSectionHeight);

          // Update positions of the resize-markers, according to the canvas

          var actualCanvas = null;
          if (canvas && canvas[0].children[1]) {
            actualCanvas = canvas[0].children[1];
          }

          var canvasTop = canvas.position().top;
          var canvasLeft = canvas.position().left;
          var canvasHeight = canvas[0].clientHeight;
          var canvasWidth = canvas[0].clientWidth;
          var iconCenterOffset = 8;
          var widthDiff = 0;

          var actualWidth = 0;
          if (actualCanvas) {
            // In some browsers, the SVG-element clientwidth isn't available, so we revert to the parent
            actualWidth = actualCanvas.clientWidth || actualCanvas.parentNode.clientWidth;
          }

          if (actualWidth < canvas[0].clientWidth) {
            widthDiff = actualWidth - canvas[0].clientWidth;
            // In case the canvas is smaller than the actual viewport, the resizers should be moved
            canvasLeft -= widthDiff / 2;
            canvasWidth += widthDiff;
          }

          var iconWidth = 17;
          var iconOffset = 20;

          var north = jQuery('#canvas-grow-N');
          north.css('top', canvasTop + iconOffset + 'px');
          north.css('left', canvasLeft - 10 + (canvasWidth - iconWidth) / 2 + 'px');

          var south = jQuery('#canvas-grow-S');
          south.css('top', (canvasTop + canvasHeight - iconOffset - iconCenterOffset) +  'px');
          south.css('left', canvasLeft - 10 + (canvasWidth - iconWidth) / 2 + 'px');

          var east = jQuery('#canvas-grow-E');
          east.css('top', canvasTop - 10 + (canvasHeight - iconWidth) / 2 + 'px');
          east.css('left', (canvasLeft + canvasWidth - iconOffset - iconCenterOffset) + 'px');

          var west = jQuery('#canvas-grow-W');
          west.css('top', canvasTop -10 + (canvasHeight - iconWidth) / 2 + 'px');
          west.css('left', canvasLeft + iconOffset + 'px');

          north = jQuery('#canvas-shrink-N');
          north.css('top', canvasTop + iconOffset + 'px');
          north.css('left', canvasLeft + 10 + (canvasWidth - iconWidth) / 2 + 'px');

          south = jQuery('#canvas-shrink-S');
          south.css('top', (canvasTop + canvasHeight - iconOffset - iconCenterOffset) +  'px');
          south.css('left', canvasLeft +10 + (canvasWidth - iconWidth) / 2 + 'px');

          east = jQuery('#canvas-shrink-E');
          east.css('top', canvasTop + 10 + (canvasHeight - iconWidth) / 2 +  'px');
          east.css('left', (canvasLeft + canvasWidth - iconOffset - iconCenterOffset) + 'px');

          west = jQuery('#canvas-shrink-W');
          west.css('top', canvasTop + 10 + (canvasHeight - iconWidth) / 2 + 'px');
          west.css('left', canvasLeft + iconOffset + 'px');
        });

        jQuery(window).trigger('resize');

        jQuery.fn.scrollStopped = function(callback) {
          jQuery(this).scroll(function(){
            var self = this, $this = jQuery(self);
            if ($this.data('scrollTimeout')) {
              clearTimeout($this.data('scrollTimeout'));
            }
            $this.data('scrollTimeout', setTimeout(callback,50,self));
          });
        };

        this.stencilInitialized = true;
      },
    }
  }
</script>
<style lang="scss">

</style>
