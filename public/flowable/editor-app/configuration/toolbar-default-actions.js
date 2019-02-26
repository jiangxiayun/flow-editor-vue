/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var FLOWABLE = FLOWABLE || {};
FLOWABLE.TOOLBAR = {
    ACTIONS: {
    	
        saveModel: function (services) {

            _internalCreateModal({
                backdrop: true,
                keyboard: true,
                template: 'editor-app/popups/save-model.html?version=' + Date.now(),
                scope: services.$scope
            }, services.$modal, services.$scope);
        },
        
        validate: function(services) {
        	
        	_internalCreateModal({
                backdrop: true,
                keyboard: true,
                template: 'editor-app/popups/validate-model.html?version=' + Date.now(),
                scope: services.$scope
            }, services.$modal, services.$scope);
		},

        undo: function (services) {

            // Get the last commands
            var lastCommands = services.$scope.undoStack.pop();

            if (lastCommands) {
                // Add the commands to the redo stack
                services.$scope.redoStack.push(lastCommands);

                // Force refresh of selection, might be that the undo command
                // impacts properties in the selected item
                if (services.$rootScope && services.$rootScope.forceSelectionRefresh) 
                {
                	services.$rootScope.forceSelectionRefresh = true;
                }
                
                // Rollback every command
                for (var i = lastCommands.length - 1; i >= 0; --i) {
                    lastCommands[i].rollback();
                }
                
                // Update and refresh the canvas
                services.editorManager.handleEvents({
                    type: ORYX.CONFIG.EVENT_UNDO_ROLLBACK,
                    commands: lastCommands
                });
                
                // Update
                services.editorManager.getCanvas().update();
                services.editorManager.updateSelection();
            }
            
            var toggleUndo = false;
            if (services.$scope.undoStack.length == 0)
            {
            	toggleUndo = true;
            }
            
            var toggleRedo = false;
            if (services.$scope.redoStack.length > 0)
            {
            	toggleRedo = true;
            }

            if (toggleUndo || toggleRedo) {
                for (var i = 0; i < services.$scope.items.length; i++) {
                    var item = services.$scope.items[i];
                    if (toggleUndo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
                        services.$scope.safeApply(function () {
                            item.enabled = false;
                        });
                    }
                    else if (toggleRedo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
                        services.$scope.safeApply(function () {
                            item.enabled = true;
                        });
                    }
                }
            }
        },

        redo: function (services) {

            // Get the last commands from the redo stack
            var lastCommands = services.$scope.redoStack.pop();

            if (lastCommands) {
                // Add this commands to the undo stack
                services.$scope.undoStack.push(lastCommands);
                
                // Force refresh of selection, might be that the redo command
                // impacts properties in the selected item
                if (services.$rootScope && services.$rootScope.forceSelectionRefresh) 
                {
                	services.$rootScope.forceSelectionRefresh = true;
                }

                // Execute those commands
                lastCommands.each(function (command) {
                    command.execute();
                });

                // Update and refresh the canvas
                services.editorManager.handleEvents({
                    type: ORYX.CONFIG.EVENT_UNDO_EXECUTE,
                    commands: lastCommands
                });

                // Update
                services.editorManager.getCanvas().update();
                services.editorManager.updateSelection();
            }

            var toggleUndo = false;
            if (services.$scope.undoStack.length > 0) {
                toggleUndo = true;
            }

            var toggleRedo = false;
            if (services.$scope.redoStack.length == 0) {
                toggleRedo = true;
            }

            if (toggleUndo || toggleRedo) {
                for (var i = 0; i < services.$scope.items.length; i++) {
                    var item = services.$scope.items[i];
                    if (toggleUndo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
                        services.$scope.safeApply(function () {
                            item.enabled = true;
                        });
                    }
                    else if (toggleRedo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
                        services.$scope.safeApply(function () {
                            item.enabled = false;
                        });
                    }
                }
            }
        },

        cut: function (services) {
            FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editCut();
            for (var i = 0; i < services.$scope.items.length; i++) {
                var item = services.$scope.items[i];
                if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
                    services.$scope.safeApply(function () {
                        item.enabled = true;
                    });
                }
            }
        },

        copy: function (services) {
            FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editCopy();
            for (var i = 0; i < services.$scope.items.length; i++) {
                var item = services.$scope.items[i];
                if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
                    services.$scope.safeApply(function () {
                        item.enabled = true;
                    });
                }
            }
        },

        paste: function (services) {
            FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editPaste();
        },

        deleteItem: function (services) {
            FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editDelete();
        },

        addBendPoint: function (services) {

            // Show the tutorial the first time
            FLOWABLE_EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, services.$translate, services.$q, true);

            var dockerPlugin = FLOWABLE.TOOLBAR.ACTIONS._getOryxDockerPlugin(services);

            var enableAdd = !dockerPlugin.enabledAdd();
            dockerPlugin.setEnableAdd(enableAdd);
            if (enableAdd)
            {
            	dockerPlugin.setEnableRemove(false);
            	document.body.style.cursor = 'pointer';
            }
            else
            {
            	document.body.style.cursor = 'default';
            }
        },

        removeBendPoint: function (services) {

            // Show the tutorial the first time
            FLOWABLE_EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, services.$translate, services.$q, true);

            var dockerPlugin = FLOWABLE.TOOLBAR.ACTIONS._getOryxDockerPlugin(services);

            var enableRemove = !dockerPlugin.enabledRemove();
            dockerPlugin.setEnableRemove(enableRemove);
            if (enableRemove)
            {
            	dockerPlugin.setEnableAdd(false);
            	document.body.style.cursor = 'pointer';
            }
            else
            {
            	document.body.style.cursor = 'default';
            }
        },

        /**
         * Helper method: fetches the Oryx Edit plugin from the provided scope,
         * if not on the scope, it is created and put on the scope for further use.
         *
         * It's important to reuse the same EditPlugin while the same scope is active,
         * as the clipboard is stored for the whole lifetime of the scope.
         */
        _getOryxEditPlugin: function (services) {
        	var $scope = services.$scope;
			var editorManager = services.editorManager;
            if ($scope.oryxEditPlugin === undefined || $scope.oryxEditPlugin === null) {
                $scope.oryxEditPlugin = new ORYX.Plugins.Edit(editorManager.getEditor());
            }
            return $scope.oryxEditPlugin;
        },

        zoomIn: function (services) {
            FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoom([1.0 + ORYX.CONFIG.ZOOM_OFFSET]);
        },

        zoomOut: function (services) {
            FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoom([1.0 - ORYX.CONFIG.ZOOM_OFFSET]);
        },
        
        zoomActual: function (services) {
            FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).setAFixZoomLevel(1);
        },
        
        zoomFit: function (services) {
        	FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoomFitToModel();
        },
        
        alignVertical: function (services) {
        	FLOWABLE.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_CENTER]);
        },
        
        alignHorizontal: function (services) {
        	FLOWABLE.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_MIDDLE]);
        },
        
        sameSize: function (services) {
        	FLOWABLE.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_SIZE]);
        },

        help: function (services) {
            FLOWABLE_EDITOR_TOUR.gettingStarted(services.$scope, services.$translate, services.$q);
        },
        
        /**
         * Helper method: fetches the Oryx View plugin from the provided scope,
         * if not on the scope, it is created and put on the scope for further use.
         */
        _getOryxViewPlugin: function (services) {
        	var $scope = services.$scope;
			var editorManager = services.editorManager;
            if ($scope.oryxViewPlugin === undefined || $scope.oryxViewPlugin === null) {
                $scope.oryxViewPlugin = new ORYX.Plugins.View(editorManager.getEditor());
            }
            return $scope.oryxViewPlugin;
        },
        
        _getOryxArrangmentPlugin: function (services) {
        	var $scope = services.$scope;
			var editorManager = services.editorManager;
            if ($scope.oryxArrangmentPlugin === undefined || $scope.oryxArrangmentPlugin === null) {
                $scope.oryxArrangmentPlugin = new ORYX.Plugins.Arrangement(editorManager.getEditor());
            }
            return $scope.oryxArrangmentPlugin;
        },

        _getOryxDockerPlugin: function (services) {
        	var $scope = services.$scope;
			var editorManager = services.editorManager;
            if ($scope.oryxDockerPlugin === undefined || $scope.oryxDockerPlugin === null) {
                $scope.oryxDockerPlugin = new ORYX.Plugins.AddDocker(editorManager.getEditor());
            }
            return $scope.oryxDockerPlugin;
        }
    }
};

