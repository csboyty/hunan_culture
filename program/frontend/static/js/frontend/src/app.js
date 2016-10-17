/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-17
 * Time: 下午4:12
 * To change this template use File | Settings | File Templates.
 */
var app=angular.module("app",["ngRoute","brantwills.paging","services","toaster","controllers","directives"]);

app.config(["$routeProvider","$locationProvider","$httpProvider","App",
    function($routeProvider,$locationProvider,$httpProvider,App){


        //默认使用的时候hash模式，如果要使用rest风格，需要设置下面这一句，注意$locationProvider需要注入
        $locationProvider.html5Mode({
            enabled: true/*,
            requireBase: false*/
        });
        //$locationProvider.hashPrefix("!");

        $routeProvider.when("/",{templateUrl: 'static/views/frontend/articles.html',controller:"articles"}).
            when("/page/:page",{templateUrl: 'static/views/frontend/articles.html',controller:"articles"}).
            when("/articles",{templateUrl: 'static/views/frontend/articles.html',controller:"articles"}).
            when("/articles/page/:page",{templateUrl: 'static/views/frontend/articles.html',controller:"articles"}).
            when("/articles/:articleId",{templateUrl: 'static/views/frontend/articleSingle.html',controller:"articleSingle"}).
            when("/search/:searchContent",{templateUrl: 'static/views/frontend/search.html',controller:"search"}).
            when("/search/:searchContent/page/:page",{templateUrl: 'static/views/frontend/search.html',controller:"search"}).
            when("/musics",{templateUrl: 'static/views/frontend/musics.html',controller:"musics"}).
            when("/musics/page/:page",{templateUrl: 'static/views/frontend/musics.html',controller:"musics"}).
            when("/videos",{templateUrl: 'static/views/frontend/videos.html',controller:"videos"}).
            when("/videos/page/:page",{templateUrl: 'static/views/frontend/videos.html',controller:"videos"}).
            when("/videos/:videoId",{templateUrl: 'static/views/frontend/videoSingle.html',controller:"videoSingle"}).
            when("/map",{templateUrl: 'static/views/frontend/map.html',controller:"map"}).
            otherwise({redirectTo: '/'});


        //禁止ajax的缓存
        //$httpProvider.defaults.cache=false;

        //ajax的一些默认配置，全局启用loading
        $httpProvider.defaults.transformRequest.push(function (data) {
            App.showLoading();

            return data;
        });

        $httpProvider.defaults.transformResponse.push(function (data) {
            App.hideLoading();

            return data;
        });

        //对返回的数据进行拦截，直接全局处理出错信息
        $httpProvider.interceptors.push(function ($q) {
            return {
                response: function (res) {
                    if(typeof res.data.success!="undefined"&&res.data.success==false){
                        App.ajaxReturnErrorHandler(res.data);
                        return $q.reject(res.data);
                    }else{
                        return res;
                    }
                },
                responseError: function (res) {
                    App.ajaxErrorHandler();
                    return $q.reject(res);
                }
            };
        });

    }]);

//在run中做一些扩展,扩展App模块，从而可以在config中使用
app.run(["$rootScope","App","AjaxErrorHandler",function($rootScope,App,AjaxErrorHandler){
    $rootScope.rootFlags={
        showLoading:false,
        showBlackOut:false
    };
    angular.extend(App,AjaxErrorHandler);

    App.showBlackOut=function(){
        $rootScope.rootFlags.showBlackOut=true;
    };
    App.hideBlackOut=function(){
        $rootScope.rootFlags.showBlackOut=false;
    };
    App.showLoading=function(){
        App.showBlackOut();
        $rootScope.rootFlags.showLoading=true;
    };
    App.hideLoading=function(){
        App.hideBlackOut();
        $rootScope.rootFlags.showLoading=false;
    };

}]);

app.controller("super",["$scope","$timeout","$location","Config",
    function($scope,$timeout,$location,Config){

        //使用对象，子scope可以直接覆盖（对象地址）
        $scope.mainFlags={
            menuName:Config.menuName.list,
            showSearch:true,
            showTip:false,
            searchContent:""
        };

        $scope.search=function(){
            $location.path("/search/"+$scope.mainFlags.searchContent);
        };
        $scope.loadShare=function(){
            $timeout(function(){
                if(document.getElementById("bdshell_js")){
                    document.getElementById('bdshell_js').src =
                        "http://bdimg.share.baidu.com/static/js/shell_v2.js?cdnversion=" + Math.ceil(new Date()/3600000);
                }else{
                    document.getElementById("bdshare_s").remove();

                    //重新加载一次shell
                    var s2=document.createElement("script");
                    s2.id="bdshell_js";
                    s2.src="http://bdimg.share.baidu.com/static/js/shell_v2.js?cdnversion="+Math.ceil(new Date()/360000);
                    document.body.appendChild(s2);
                }
            },200);
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total){
            var oldPath=$location.path(),newPath;
            if(oldPath.indexOf("page")!=-1){
                newPath=oldPath.replace(/[\d]+/g,page);
            }else{
                newPath=oldPath+(oldPath=="/"?"page/":"/page/")+page;
            }

            $location.path(newPath);
        };
    }]);
