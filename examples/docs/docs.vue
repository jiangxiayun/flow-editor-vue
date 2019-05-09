<template>
  <div id="app" class="full-height">
    <header
        class="page-header"
        style="box-shadow:0 10px 60px 0 rgba(29,29,31,0.07)">
      <div class="header-container">
        <span class="name">flow-editor-vue</span>
        <div class="link">
          <router-link to="/design/kpm/1">示例</router-link>
          <a
              href="https://github.com/jiangxiayun/flow-editor-vue"
              target="_blank"
              class="github-link"
          >
            <svg
                height="28"
                width="28"
                viewBox="0 0 16 16"
                version="1.1"
                aria-hidden="true"
                class="octicon octicon-mark-github"
            >
              <path
                  fill-rule="evenodd"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              ></path>
            </svg>
          </a>
        </div>

      </div>
    </header>
    <div class="container">
      <sideNav class="nav"></sideNav>
      <router-view class="view"></router-view>
    </div>
  </div>
</template>

<script>
  import sideNav from './side-nav.vue'

  export default {
    name: 'app',
    data () {
      return {
        isMobileShow: false
      }
    },
    mounted () {},
    components: { sideNav }
  }
</script>
<style lang="scss">
  @import './assets/scss/index.scss';
</style>
<style lang="scss" scoped>
  .page-header {
    background-color: #fff;
    box-shadow: 0 10px 60px 0 rgba(29, 29, 31, 0.07);
    opacity: 0.98;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    z-index: 100;
    .header-container {
      width: 90%;
      margin: 0 auto;
      a {
        display: inline-block;
        padding: 0 20px;
        cursor: pointer;
        vertical-align: middle;
        font-size: 14px;
        color: #333333;
      }
      .name {
        font-size: 20px;
        margin-left: 5px;
        height: 60px;
        line-height: 60px;
      }
      .icon {
        width: 100px;
      }
      .link {
        float: right;
        margin-top: 15px;
        .github-link {
          transition: 0.5s all;
          opacity: 0.5;
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .container {
    margin: 16px;
    background-color: #fff;
    box-shadow: 0 4px 30px 0 rgba(223, 225, 230, 0.5);
    height: calc(100% - 92px);
    position: relative;
    overflow: auto;
    .nav {
      /*float: left;*/
      width: 210px;
      position: absolute;
    }
    .view {
      /*float: left;*/
      width: calc(100% - 215px);
      padding: 20px 28px 28px 238px;
    }
  }
</style>
