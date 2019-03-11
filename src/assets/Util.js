// Helper method: find a group in an array
export function findGroup (name, groupArray) {
  for (var index = 0; index < groupArray.length; index++) {
    if (groupArray[index].name === name) {
      return groupArray[index];
    }
  }
  return null;
}

// Helper method: add a new group to an array of groups
export function addGroup (groupName, groupArray) {
  var group = { name: groupName, items: [], paletteItems: [], groups: [], visible: true };
  groupArray.push(group);
  return group;
}

export function getAdditionalIEZoom () {
  let additionalIEZoom = 1
  if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
    let ua = navigator.userAgent
    if (ua.indexOf('MSIE') >= 0) {
      // IE 10 and below
      let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
      if (zoom !== 100) {
        additionalIEZoom = zoom / 100
      }
    }
  }
  return additionalIEZoom
}

/**
 * This creates a modal window that auto closes on route change.
 * By default, this is NOT the case, and leads to some funny behaviour.
 *
 * Use this method vs the default $modal({myJson}) approach
 */
export function _internalCreateModal (modalConfig, $modal, $scope) {
  if ($scope !== null && $scope !== undefined) {
    $scope.modal = $modal(modalConfig);

    $scope.$on('$routeChangeStart', function () {
      if ($scope.modal) {
        $scope.modal.hide();
      }
    });

    return $scope.modal;
  } else {
    return $modal(modalConfig);
  }
}