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

export function extendDeep(parent, child) {

  let proxy = null

  proxy = JSON.stringify(parent); // 把parent对象转换成字符串
  proxy = JSON.parse(proxy) // 把字符串转换成对象，这是parent的一个副本

  child = child || {};

  for(let i in proxy) {
    // 判断对象是否包含特定的自身（非继承）属性
    if(proxy.hasOwnProperty(i)) {
      child[i] = proxy[i];
    }
  }

  proxy = null; // 因为proxy是中间对象，可以将它回收掉

  return child;
}