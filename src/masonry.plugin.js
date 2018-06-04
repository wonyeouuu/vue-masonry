import Masonry from 'masonry-layout'
import ImageLoaded from 'imagesloaded'

const EVENT_ADD = 'vuemasonry.itemAdded'
const EVENT_REMOVE = 'vuemasonry.itemRemoved'
const EVENT_IMAGE_LOADED = 'vuemasonry.imageLoaded'
const EVENT_DESTROY = 'vuemasonry.destroy'

export const VueMasonryPlugin = function () {}

VueMasonryPlugin.install = function (Vue, options) {
  const Events = new Vue({})

  Vue.directive('masonry', {
    props: ['transitionDuration', ' itemSelector'],

    inserted: function (el, nodeObj) {
      if (!Masonry) {
        throw new Error('Masonry plugin is not defined. Please check it\'s connected and parsed correctly.')
      }
      const masonry = new Masonry(el, nodeObj.value)
      const masonryDraw = function () {
        masonry.reloadItems()
        masonry.layout()
      }
      Vue.nextTick(function () {
        masonryDraw()
      })

      const masonryRedrawHandler = function (eventData) {
        masonryDraw()
      }

      const masonryDestroyHandler = function (eventData) {
        Events.$off(EVENT_ADD, masonryRedrawHandler)
        Events.$off(EVENT_REMOVE, masonryRedrawHandler)
        Events.$off(EVENT_IMAGE_LOADED, masonryRedrawHandler)
        Events.$off(EVENT_DESTROY, masonryDestroyHandler)
        masonry.destroy()
      }

      Events.$on(EVENT_ADD, masonryRedrawHandler)
      Events.$on(EVENT_REMOVE, masonryRedrawHandler)
      Events.$on(EVENT_IMAGE_LOADED, masonryRedrawHandler)
      Events.$on(EVENT_DESTROY, masonryDestroyHandler)
    },
    unbind: function (el, nodeObj) {
      Events.$emit(EVENT_DESTROY)
    }
  })

  Vue.directive('masonryTile', {

    inserted: function (el) {
      Events.$emit(EVENT_ADD, {
        'element': el
      })
      // eslint-disable-next-line
      new ImageLoaded(el, function () {
        Events.$emit(EVENT_IMAGE_LOADED, {
          'element': el
        })
      })
    },
    beforeDestroy: function (el) {
      Events.$emit(EVENT_REMOVE, {
        'element': el
      })
    }
  })

  Vue.prototype.$redrawVueMasonry = function () {
    Events.$emit(EVENT_ADD)
  }
}
