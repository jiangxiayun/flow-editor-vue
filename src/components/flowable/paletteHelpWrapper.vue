<template>
  <!--组件元素-->
  <div id="paletteHelpWrapper" class="col-xs-3">
    <div class="stencils" id="paletteSection">
      <div v-if="stencilItemGroups.length > 1">
        <div v-for="(group, index) in stencilItemGroups" :key="group.name">
          <ul v-if="group.visible && group.items" class="stencil-group"
              :class="{collapsed: !group.expanded, 'first': index == 0}">
            <li>
              <stencil-item-template :group="group" :editorManager="editorManager"
                                     @expandedToggle="expandedToggle(group)">
              </stencil-item-template>
            </li>
          </ul>

          <div v-if="!group.items">
            <root-stencil-item-template :group="group"></root-stencil-item-template>
          </div>

        </div>
      </div>
      <div v-if="stencilItemGroups.length == 1">
        <ul class="stencil-group">
          <li v-for="item in stencilItemGroups[0].paletteItems" class="stencil-item"
              :key="item.id"
              :id="item.id"
              :title="item.description"

              data-drag="true"
              jqyoui-draggable="{onStart:'startDragCallback', onDrag:'dragCallback'}"
              data-jqyoui-options="{revert: 'invalid', helper: 'clone', opacity : 0.5}">

            <img :src="`../../assets/images/stencilsets/bpmn2.0/icons/${item.icon}`" width="16px;" height="16px;"/>
            <img v-if="!item.customIcon" width="16px;" height="16px;"
                 :src="`../../assets/images/stencilsets/${getStencilSetName()}/icons/${item.icon}`"/>
            <img v-if="item.customIcon" width="16px;" height="16px;"
                 :src="getImageUrl(item.icon)" />
            {{item.name | translate}}
          </li>
          <!--ng-model="draggedElement"-->
        </ul>
      </div>
    </div>
    <!--ng-controller="ProcessNavigatorController"-->
    <div id="process-treeview-wrapper">
      <div class="process-treeview-header">
        Process Navigator
      </div>
      <div class="process-treeview-body" v-show="isEditorReady">
        <div class="process-treeview-process-title" :title="treeview.id"
             :class="{'current-process': treeview.current}" >
          Process: {{treeview.name}}
          <img v-show="!treeview.current"
               src="/flowable/editor-app/images/pencil.png" class="pull-right"
               @click="edit(treeview.id)" />
        </div>
        <ul class="process-treeview-list" v-if="treeview.children">
          <li v-for="child in treeview.children" :key="child.id">
            <process-tree-list :editorManager="editorManager" @edit="edit"></process-tree-list>
          </li>

        </ul>
        <div v-if="!treeview.children || treeview.children.length == 0" style="padding-left: 5px;">
          No structural elements used.
        </div>
      </div>
    </div>
    <div id="paletteSectionFooter">
      <i class="glyphicon glyphicon-chevron-left"></i>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import stencilItemTemplate from '@/components/flowable/stencil-item-template'
  import processTreeList from '@/components/flowable/process-tree-list'
  import rootStencilItemTemplate from '@/components/flowable/root-stencil-item-template'

  export default {
    name: "paletteHelpWrapper",
    data () {
      return {
        treeview: {},
        isEditorReady: false
      }
    },
    components: {stencilItemTemplate, processTreeList, rootStencilItemTemplate},
    props: {
      editorManager: {}
    },
    mounted () {

    },
    computed: {
      ...mapState('Flowable', ['stencilItemGroups'])
    },
    methods: {
      ...mapMutations('Flowable', ['UPDATE_stencilItemGroups', 'UPDATE_quickMenuItems']),
      init () {
        var data = this.editorManager.getStencilData();

        var quickMenuDefinition = undefined;
        var ignoreForPaletteDefinition = undefined;
        if (data.namespace == 'http://b3mn.org/stencilset/cmmn1.1#') {
          quickMenuDefinition = ['HumanTask', 'Association'];
          ignoreForPaletteDefinition = ['CasePlanModel'];
        } else {
          quickMenuDefinition = ['UserTask', 'EndNoneEvent', 'ExclusiveGateway',
            'CatchTimerEvent', 'ThrowNoneEvent', 'TextAnnotation',
            'SequenceFlow', 'Association'];
          ignoreForPaletteDefinition = ['SequenceFlow', 'MessageFlow', 'Association', 'DataAssociation', 'DataStore', 'SendTask'];
        }

        var quickMenuItems = [];
        var morphRoles = [];
        for (let i = 0; i < data.rules.morphingRules.length; i++) {
          var role = data.rules.morphingRules[i].role;
          var roleItem = {'role': role, 'morphOptions': []};
          morphRoles.push(roleItem);
        }

        let stencilItemGroups_ary = []

        // Check all received items
        for (let stencilIndex = 0; stencilIndex < data.stencils.length; stencilIndex++) {
          // Check if the root group is the 'diagram' group. If so, this item should not be shown.
          var currentGroupName = data.stencils[stencilIndex].groups[0];
          if (currentGroupName === 'Diagram' || currentGroupName === 'Form') {
            continue;  // go to next item
          }

          var removed = false;
          if (data.stencils[stencilIndex].removed) {
            removed = true;
          }

          var currentGroup = undefined;
          if (!removed) {
            // Check if this group already exists. If not, we create a new one
            if (currentGroupName !== null && currentGroupName !== undefined && currentGroupName.length > 0) {

              currentGroup = this.findGroup(currentGroupName, stencilItemGroups_ary); // Find group in root groups array
              if (currentGroup === null) {
                currentGroup = this.addGroup(currentGroupName, stencilItemGroups_ary);
              }

              // Add all child groups (if any)
              for (var groupIndex = 1; groupIndex < data.stencils[stencilIndex].groups.length; groupIndex++) {
                var childGroupName = data.stencils[stencilIndex].groups[groupIndex];
                var childGroup = this.findGroup(childGroupName, currentGroup.groups);
                if (childGroup === null) {
                  childGroup = this.addGroup(childGroupName, currentGroup.groups);
                }

                // The current group variable holds the parent of the next group (if any),
                // and is basically the last element in the array of groups defined in the stencil item
                currentGroup = childGroup;
              }
            }
          }

          // Construct the stencil item
          var stencilItem = {
            'id': data.stencils[stencilIndex].id,
            'name': data.stencils[stencilIndex].title,
            'description': data.stencils[stencilIndex].description,
            'icon': data.stencils[stencilIndex].icon,
            'type': data.stencils[stencilIndex].type,
            'roles': data.stencils[stencilIndex].roles,
            'removed': removed,
            'customIcon': false,
            'canConnect': false,
            'canConnectTo': false,
            'canConnectAssociation': false
          };

          if (data.stencils[stencilIndex].customIconId && data.stencils[stencilIndex].customIconId > 0) {
            stencilItem.customIcon = true;
            stencilItem.icon = data.stencils[stencilIndex].customIconId;
          }

          if (!removed) {
            if (quickMenuDefinition.indexOf(stencilItem.id) >= 0) {
              quickMenuItems[quickMenuDefinition.indexOf(stencilItem.id)] = stencilItem;
            }
          }

          if (stencilItem.id === 'TextAnnotation' || stencilItem.id === 'BoundaryCompensationEvent') {
            stencilItem.canConnectAssociation = true;
          }

          for (let i = 0; i < data.stencils[stencilIndex].roles.length; i++) {
            var stencilRole = data.stencils[stencilIndex].roles[i];
            if (data.namespace == 'http://b3mn.org/stencilset/cmmn1.1#') {
              if (stencilRole === 'association_start') {
                stencilItem.canConnect = true;
              } else if (stencilRole === 'association_end') {
                stencilItem.canConnectTo = true;
              }
            } else {
              if (stencilRole === 'sequence_start') {
                stencilItem.canConnect = true;
              } else if (stencilRole === 'sequence_end') {
                stencilItem.canConnectTo = true;
              }
            }

            for (let j = 0; j < morphRoles.length; j++) {
              if (stencilRole === morphRoles[j].role) {
                if (!removed) {
                  morphRoles[j].morphOptions.push(stencilItem);
                }
                stencilItem.morphRole = morphRoles[j].role;
                break;
              }
            }
          }


          if (currentGroup) {
            // Add the stencil item to the correct group
            currentGroup.items.push(stencilItem);
            if (ignoreForPaletteDefinition.indexOf(stencilItem.id) < 0) {
              currentGroup.paletteItems.push(stencilItem);
            }
          } else {
            // It's a root stencil element
            if (!removed) {
              stencilItemGroups_ary.push(stencilItem);
            }
          }

        }

        for (let i = 0; i < stencilItemGroups_ary.length; i++)  {
          if (stencilItemGroups_ary[i].paletteItems && stencilItemGroups_ary[i].paletteItems.length == 0) {
            stencilItemGroups_ary[i].visible = false;
          }
        }

        console.log('stencilItemGroups_ary', stencilItemGroups_ary)
        this.UPDATE_stencilItemGroups(stencilItemGroups_ary)
        console.log('stencilItemGroups', this.stencilItemGroups)

        var containmentRules = [];
        for (let i = 0; i < data.rules.containmentRules.length; i++) {
          var rule = data.rules.containmentRules[i];
          containmentRules.push(rule);
        }
        this.containmentRules = containmentRules;
        // remove quick menu items which are not available anymore due to custom pallette
        var availableQuickMenuItems = [];
        for (var i = 0; i < quickMenuItems.length; i++) {
          if (quickMenuItems[i]) {
            availableQuickMenuItems[availableQuickMenuItems.length] = quickMenuItems[i];
          }
        }

        this.UPDATE_quickMenuItems(availableQuickMenuItems)
        this.morphRoles = morphRoles;
        /*
                    * Listen to selection change events: show properties
                    */
        this.editorManager.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, (event) => {
          var shapes = event.elements;
          var canvasSelected = false;
          if (shapes && shapes.length == 0) {
            shapes = [this.editorManager.getCanvas()];
            canvasSelected = true;
          }
          if (shapes && shapes.length > 0) {

            var selectedShape = shapes.first();
            var stencil = selectedShape.getStencil();

            if (this.selectedElementBeforeScrolling && stencil.id().indexOf('BPMNDiagram') !== -1 && stencil.id().indexOf('CMMNDiagram') !== -1) {
              // ignore canvas event because of empty selection when scrolling stops
              return;
            }

            if (this.selectedElementBeforeScrolling && this.selectedElementBeforeScrolling.getId() === selectedShape.getId()) {
              this.selectedElementBeforeScrolling = null;
              return;
            }

            // Store previous selection
            this.previousSelectedShape = this.selectedShape;

            // Only do something if another element is selected (Oryx fires this event multiple times)
            if (this.selectedShape !== undefined && this.selectedShape.getId() === selectedShape.getId()) {
              if (this.forceSelectionRefresh) {
                // Switch the flag again, this run will force refresh
                this.forceSelectionRefresh = false;
              } else {
                // Selected the same element again, no need to update anything
                return;
              }
            }

            var selectedItem = {'title': '', 'properties': []};

            if (canvasSelected) {
              selectedItem.auditData = {
                'author': this.modelData.createdByUser,
                'createDate': this.modelData.createDate
              };
            }

            // Gather properties of selected item
            var properties = stencil.properties();
            for (var i = 0; i < properties.length; i++) {
              var property = properties[i];
              if (property.popular() == false) continue;
              var key = property.prefix() + "-" + property.id();

              if (key === 'oryx-name') {
                selectedItem.title = selectedShape.properties.get(key);
              }

              // First we check if there is a config for 'key-type' and then for 'type' alone
              var propertyConfig = FLOWABLE.PROPERTY_CONFIG[key + '-' + property.type()];
              if (propertyConfig === undefined || propertyConfig === null) {
                propertyConfig = FLOWABLE.PROPERTY_CONFIG[property.type()];
              }

              if (propertyConfig === undefined || propertyConfig === null) {
                console.log('WARNING: no property configuration defined for ' + key + ' of type ' + property.type());
              } else {

                if (selectedShape.properties.get(key) === 'true') {
                  selectedShape.properties.set(key, true);
                }

                if (FLOWABLE.UI_CONFIG.showRemovedProperties == false && property.isHidden()) {
                  continue;
                }

                var currentProperty = {
                  'key': key,
                  'title': property.title(),
                  'description': property.description(),
                  'type': property.type(),
                  'mode': 'read',
                  'hidden': property.isHidden(),
                  'value': selectedShape.properties.get(key)
                };

                if ((currentProperty.type === 'complex' || currentProperty.type === 'multiplecomplex') && currentProperty.value && currentProperty.value.length > 0) {
                  try {
                    currentProperty.value = JSON.parse(currentProperty.value);
                  } catch (err) {
                    // ignore
                  }
                }

                if (propertyConfig.readModeTemplateUrl !== undefined && propertyConfig.readModeTemplateUrl !== null) {
                  currentProperty.readModeTemplateUrl = propertyConfig.readModeTemplateUrl + '?version=' + this.staticIncludeVersion;
                }
                if (propertyConfig.writeModeTemplateUrl !== null && propertyConfig.writeModeTemplateUrl !== null) {
                  currentProperty.writeModeTemplateUrl = propertyConfig.writeModeTemplateUrl + '?version=' + this.staticIncludeVersion;
                }

                if (propertyConfig.templateUrl !== undefined && propertyConfig.templateUrl !== null) {
                  currentProperty.templateUrl = propertyConfig.templateUrl + '?version=' + this.staticIncludeVersion;
                  currentProperty.hasReadWriteMode = false;
                }
                else {
                  currentProperty.hasReadWriteMode = true;
                }

                if (currentProperty.value === undefined
                  || currentProperty.value === null
                  || currentProperty.value.length == 0) {
                  currentProperty.noValue = true;
                }

                selectedItem.properties.push(currentProperty);
              }
            }

            // Need to wrap this in an $apply block, see http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
            this.safeApply(() => {
              this.selectedItem = selectedItem;
              this.selectedShape = selectedShape;
            });

          } else {
            this.safeApply(() => {
              this.selectedItem = {};
              this.selectedShape = null;
            });
          }
        });

        this.editorManager.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, (event) => {
          FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS);
          var shapes = event.elements;

          if (shapes && shapes.length == 1) {

            var selectedShape = shapes.first();

            var a = this.editorManager.getCanvas().node.getScreenCTM();

            var absoluteXY = selectedShape.absoluteXY();

            absoluteXY.x *= a.a;
            absoluteXY.y *= a.d;

            var additionalIEZoom = 1;
            if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
              var ua = navigator.userAgent;
              if (ua.indexOf('MSIE') >= 0) {
                //IE 10 and below
                var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                if (zoom !== 100) {
                  additionalIEZoom = zoom / 100
                }
              }
            }

            if (additionalIEZoom === 1) {
              absoluteXY.y = absoluteXY.y - jQuery("#canvasSection").offset().top + 5;
              absoluteXY.x = absoluteXY.x - jQuery("#canvasSection").offset().left;

            } else {
              var canvasOffsetLeft = jQuery("#canvasSection").offset().left;
              var canvasScrollLeft = jQuery("#canvasSection").scrollLeft();
              var canvasScrollTop = jQuery("#canvasSection").scrollTop();

              var offset = a.e - (canvasOffsetLeft * additionalIEZoom);
              var additionaloffset = 0;
              if (offset > 10) {
                additionaloffset = (offset / additionalIEZoom) - offset;
              }
              absoluteXY.y = absoluteXY.y - (jQuery("#canvasSection").offset().top * additionalIEZoom) + 5 + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop);
              absoluteXY.x = absoluteXY.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft);
            }

            var bounds = new ORYX.Core.Bounds(a.e + absoluteXY.x, a.f + absoluteXY.y, a.e + absoluteXY.x + a.a*selectedShape.bounds.width(), a.f + absoluteXY.y + a.d*selectedShape.bounds.height());
            var shapeXY = bounds.upperLeft();

            var stencilItem = this.getStencilItemById(selectedShape.getStencil().idWithoutNs());
            var morphShapes = [];
            if (stencilItem && stencilItem.morphRole) {
              for (var i = 0; i < this.morphRoles.length; i++) {
                if (this.morphRoles[i].role === stencilItem.morphRole) {
                  morphShapes = this.morphRoles[i].morphOptions;
                }
              }
            }

            var x = shapeXY.x;
            if (bounds.width() < 48) {
              x -= 24;
            }

            if (morphShapes && morphShapes.length > 0) {
              // In case the element is not wide enough, start the 2 bottom-buttons more to the left
              // to prevent overflow in the right-menu

              var morphButton = document.getElementById('morph-button');
              morphButton.style.display = "block";
              morphButton.style.left = x + 24 +'px';
              morphButton.style.top = (shapeXY.y+bounds.height() + 2) + 'px';
            }

            var deleteButton = document.getElementById('delete-button');
            deleteButton.style.display = "block";
            deleteButton.style.left = x + 'px';
            deleteButton.style.top = (shapeXY.y+bounds.height() + 2) + 'px';

            var editable = selectedShape._stencil._jsonStencil.id.endsWith('CollapsedSubProcess') ;
            var editButton = document.getElementById('edit-button');
            if (editable) {
              editButton.style.display = "block";
              if (morphShapes && morphShapes.length > 0) {
                editButton.style.left = x + 24 + 24 + 'px';
              } else {
                editButton.style.left = x + 24 +'px';
              }
              editButton.style.top = (shapeXY.y+bounds.height() + 2) + 'px';

            } else {
              editButton.style.display = "none";
            }

            if (stencilItem && (stencilItem.canConnect || stencilItem.canConnectAssociation)) {
              var quickButtonCounter = 0;
              var quickButtonX = shapeXY.x+bounds.width() + 5;
              var quickButtonY = shapeXY.y;
              jQuery('.Oryx_button').each(function(i, obj) {
                if (obj.id !== 'morph-button' && obj.id != 'delete-button' && obj.id !== 'edit-button') {
                  quickButtonCounter++;
                  if (quickButtonCounter > 3) {
                    quickButtonX = shapeXY.x+bounds.width() + 5;
                    quickButtonY += 24;
                    quickButtonCounter = 1;

                  } else if (quickButtonCounter > 1) {
                    quickButtonX += 24;
                  }

                  obj.style.display = "block";
                  obj.style.left = quickButtonX + 'px';
                  obj.style.top = quickButtonY + 'px';
                }
              });
            }
          }
        });

        //if an element is added te properties will catch this event.
        FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED, this.filterEvent);
        FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_ITEM_DROPPED, this.filterEvent);
        FLOWABLE.eventBus.addListener("EDITORMANAGER-EDIT-ACTION", () => {
          this.renderProcessHierarchy();
        });
      },
      showSubProcess (child) {
        var flowableShapes = this.editorManager.getChildShapeByResourceId(child.resourceId);
        this.editorManager.setSelection([flowableShapes],[],true);
      },
      edit (resourceId) {
        this.editorManager.edit(resourceId);
      },
      filterEvent(event){
        //this event is fired when the user changes a property by the property editor.
        if(event.type === "event-type-property-value-changed"){
          if(event.property.key === "oryx-overrideid" || event.property.key === "oryx-name"){
            this.renderProcessHierarchy()
          }
          //this event is fired when the stencil / shape's text is changed / updated.
        }else if(event.type === "propertyChanged"){
          if(event.name === "oryx-overrideid" || event.name === "oryx-name"){
            this.renderProcessHierarchy();
          }
        }else if(event.type === ORYX.CONFIG.ACTION_DELETE_COMPLETED){
          this.renderProcessHierarchy();
          //for some reason the new tree does not trigger an ui update.
          //$scope.$apply();
        }else if(event.type === "event-type-item-dropped"){
          this.renderProcessHierarchy();
        }
      },
      renderProcessHierarchy(){
        //only start calculating when the editor has done all his constructor work.
        if(!this.isEditorReady){
          return false;
        }

        if (!this.editorManager.isLoading()){
          //the current implementation of has a lot of eventlisteners. when calling getTree() it could manipulate
          //the canvastracker while the canvas is stille loading stuff.
          //TODO: check if its possible to trigger the re-rendering by a single event instead of registering on 10 events...
          this.treeview = this.editorManager.getTree();
        }

      },
      expandedToggle (group) {
        let expanded = !group.expanded
        this.$set(group, 'expanded',  expanded)
      }
    },
    watch: {
      editorManager () {
        this.init()
      }
    }
  }
</script>

<style scoped>

</style>