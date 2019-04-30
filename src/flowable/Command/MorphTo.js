// 切换元素类型
import ORYX from 'src/oryx'

export default class MorphTo extends ORYX.Core.Command {
  constructor (shape, stencil, facade) {
    super()
    this.shape = shape
    this.stencil = stencil
    this.facade = facade
  }

  execute () {
    const shape = this.shape
    const stencil = this.stencil
    const resourceId = shape.resourceId

    // Serialize all attributes
    let serialized = shape.serialize()
    stencil.properties().each((function (prop) {
      if (prop.readonly()) {
        serialized = serialized.reject(function (serProp) {
          return serProp.name === prop.id()
        })
      }
    }).bind(this))

    // Get shape if already created, otherwise create a new shape
    if (this.newShape) {
      this.facade.getCanvas().add(this.newShape)
    } else {
      this.newShape = this.facade.createShape({
        type: stencil.id(),
        namespace: stencil.namespace(),
        resourceId: resourceId
      })
    }

    // calculate new bounds using old shape's upperLeft and new shape's width/height
    let boundsObj = serialized.find(function (serProp) {
      return (serProp.prefix === 'oryx' && serProp.name === 'bounds')
    })

    let changedBounds = null

    if (!this.facade.getRules().preserveBounds(shape.getStencil())) {
      let bounds = boundsObj.value.split(',')
      if (parseInt(bounds[0], 10) > parseInt(bounds[2], 10)) {
        // if lowerRight comes first, swap array items
        let tmp = bounds[0]
        bounds[0] = bounds[2]
        bounds[2] = tmp
        tmp = bounds[1]
        bounds[1] = bounds[3]
        bounds[3] = tmp
      }
      bounds[2] = parseInt(bounds[0], 10) + this.newShape.bounds.width()
      bounds[3] = parseInt(bounds[1], 10) + this.newShape.bounds.height()
      boundsObj.value = bounds.join(',')
    } else {
      let height = shape.bounds.height()
      let width = shape.bounds.width()

      // consider the minimum and maximum size of
      // the new shape

      if (this.newShape.minimumSize) {
        if (shape.bounds.height() < this.newShape.minimumSize.height) {
          height = this.newShape.minimumSize.height
        }

        if (shape.bounds.width() < this.newShape.minimumSize.width) {
          width = this.newShape.minimumSize.width
        }
      }

      if (this.newShape.maximumSize) {
        if (shape.bounds.height() > this.newShape.maximumSize.height) {
          height = this.newShape.maximumSize.height
        }

        if (shape.bounds.width() > this.newShape.maximumSize.width) {
          width = this.newShape.maximumSize.width
        }
      }

      changedBounds = {
        a: {
          x: shape.bounds.a.x,
          y: shape.bounds.a.y
        },
        b: {
          x: shape.bounds.a.x + width,
          y: shape.bounds.a.y + height
        }
      }
    }

    let oPos = shape.bounds.center()
    if (changedBounds !== null) {
      this.newShape.bounds.set(changedBounds)
    }

    // Set all related dockers
    this.setRelatedDockers(shape, this.newShape)

    // store DOM position of old shape
    let parentNode = shape.node.parentNode
    let nextSibling = shape.node.nextSibling

    // Delete the old shape
    this.facade.deleteShape(shape)

    // Deserialize the new shape - Set all attributes
    this.newShape.deserialize(serialized)
    /*
     * Change color to default if unchanged
     * 23.04.2010
     */
    if (shape.getStencil().property('oryx-bgcolor')
      && shape.properties['oryx-bgcolor']
      && shape.getStencil().property('oryx-bgcolor').value().toUpperCase() === shape.properties['oryx-bgcolor'].toUpperCase()) {
      if (this.newShape.getStencil().property('oryx-bgcolor')) {
        this.newShape.setProperty('oryx-bgcolor', this.newShape.getStencil().property('oryx-bgcolor').value())
      }
    }

    if (changedBounds !== null) {
      this.newShape.bounds.set(changedBounds)
    }

    if (this.newShape.getStencil().type() === 'edge' || (this.newShape.dockers.length === 0 || !this.newShape.dockers[0].getDockedShape())) {
      this.newShape.bounds.centerMoveTo(oPos)
    }

    if (this.newShape.getStencil().type() === 'node' && (this.newShape.dockers.length === 0 || !this.newShape.dockers[0].getDockedShape())) {
      this.setRelatedDockers(this.newShape, this.newShape)
    }

    // place at the DOM position of the old shape
    if (nextSibling) parentNode.insertBefore(this.newShape.node, nextSibling)
    else parentNode.appendChild(this.newShape.node)

    // Set selection
    this.facade.setSelection([this.newShape])
    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }

  rollback () {
    if (!this.shape || !this.newShape || !this.newShape.parent) {
      return
    }
    // Append shape to the parent
    this.newShape.parent.add(this.shape)
    // Set dockers
    this.setRelatedDockers(this.newShape, this.shape)
    // Delete new shape
    this.facade.deleteShape(this.newShape)
    // Set selection
    this.facade.setSelection([this.shape])
    // Update
    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }

  /**
   * Set all incoming and outgoing edges from the shape to the new shape
   * @param {Shape} shape
   * @param {Shape} newShape
   */
  setRelatedDockers (shape, newShape) {
    if (shape.getStencil().type() === 'node') {

      (shape.incoming || []).concat(shape.outgoing || [])
        .each(function (i) {
          i.dockers.each(function (docker) {
            if (docker.getDockedShape() == shape) {
              let rPoint = Object.clone(docker.referencePoint)
              // Move reference point per percent

              let rPointNew = {
                x: rPoint.x * newShape.bounds.width() / shape.bounds.width(),
                y: rPoint.y * newShape.bounds.height() / shape.bounds.height()
              }

              docker.setDockedShape(newShape)
              // Set reference point and center to new position
              docker.setReferencePoint(rPointNew)
              if (i instanceof ORYX.Core.Edge) {
                docker.bounds.centerMoveTo(rPointNew)
              } else {
                let absXY = shape.absoluteXY()
                docker.bounds.centerMoveTo({ x: rPointNew.x + absXY.x, y: rPointNew.y + absXY.y })
                //docker.bounds.moveBy({x:rPointNew.x-rPoint.x, y:rPointNew.y-rPoint.y});
              }
            }
          })
        })

      // for attached events
      if (shape.dockers.length > 0 && shape.dockers.first().getDockedShape()) {
        newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape())
        newShape.dockers.first().setReferencePoint(Object.clone(shape.dockers.first().referencePoint))
      }

    } else { // is edge
      newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape())
      newShape.dockers.first().setReferencePoint(shape.dockers.first().referencePoint)
      newShape.dockers.last().setDockedShape(shape.dockers.last().getDockedShape())
      newShape.dockers.last().setReferencePoint(shape.dockers.last().referencePoint)
    }
  }
}
