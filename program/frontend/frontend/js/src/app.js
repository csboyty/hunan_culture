/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-17
 * Time: 下午4:12
 * To change this template use File | Settings | File Templates.
 */
var app=angular.module("app",["ngTouch","services","viewControllers","directives","filters","toaster"]);

app.config(["$locationProvider","$httpProvider","App",
    function($locationProvider,$httpProvider,App){

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
                request:function(config){

                    //消除服务端缓存的影响
                    if(config.method=='GET'&&config.url.indexOf("views")==-1){
                        var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                        config.url = config.url+separator+'noCache=' + new Date().getTime();
                    }

                    return config||$q.reject(config);
                },
                response: function (res) {
                    //console.log(res);
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
app.run(["$rootScope","$templateCache","App","AjaxErrorHandler",
    function($rootScope,$templateCache,App,AjaxErrorHandler){
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

app.controller("super",["$scope","$location","$window","Config","Storage","toaster","App","CFunctions","Post",
    function($scope,$location,$window,Config,Storage,toaster,App,CFunctions,Post){

        //使用对象，子scope可以直接覆盖（对象地址）
        $scope.mainVars={
            contentTemplate:Config.viewUrls.postList,
            townDetailUrl:"",
            activeTabIndex:1,
            activeCategory:"",
            searchContent:"",
            showMain:true,
            showTownDetail:false,
            popWindowTemplate:"",
            showPopWindow:false,
            isMobile:CFunctions.checkMobile()["isMobile"]
        };
        $scope.showBlackOut=function(){
            App.showBlackOut();
        };
        $scope.hideBlackOut=function(){
            App.hideBlackOut();
        };
        $scope.hidePopWindow=function(){
            $scope.mainVars.showPopWindow=false;
            $scope.mainVars.showMain=true;
            $scope.mainVars.popWindowTemplate="";
        };

        $scope.showSinglePost=function(postId){
            $scope.mainVars.showPopWindow=true;
            $scope.mainVars.popWindowTemplate=Config.viewUrls.postDetail;
            Storage.currentPostId=postId;
            Storage.oldBodyScrollTop=$window.scrollY;
        };

        $scope.searchInputKeyDown=function(event){
            if(event.keyCode==13){
                if( CFunctions.searchInArray(Storage.keywords,$scope.mainVars.searchContent)){
                    //更换到列表页面
                    $scope.mainVars.contentTemplate=Config.viewUrls.postList+"?"+new Date().getTime();
                    $scope.mainVars.showMain=true;
                    $scope.mainVars.showTownDetail=false;
                    $scope.mainVars.townDetailUrl="";
                    $scope.mainVars.activeTabIndex=1;
                    $scope.mainVars.activeCategory="";

                }else{
                    $scope.mainVars.searchContent="";
                    toaster.pop('error',Config.messages.errorTitle,Config.messages.keywordNoResult);
                }
            }
        };
        $scope.searchCategory=function(category){
            $scope.mainVars.activeCategory=category;

            //刷新当前的include，加载数据
            if($scope.mainVars.showTownDetail){
                $scope.mainVars.townDetailUrl=$scope.mainVars.townDetailUrl+"?"+new Date().getTime();
            }else{
                $scope.mainVars.contentTemplate=$scope.mainVars.contentTemplate+"?"+new Date().getTime();
            }

        };
        $scope.setActiveTab=function(index){
            switch (index){
                case 1:
                    $scope.mainVars.contentTemplate=Config.viewUrls.postList;
                    break;
                case 2:
                    $scope.mainVars.contentTemplate=Config.viewUrls.map;
                    break;
            }

            Storage.currentTownId=0;
            $scope.mainVars.activeCategory="";
            $scope.mainVars.searchContent="";
            $scope.mainVars.activeTabIndex=index;
        };

        Post.resource.getAllKeywords(function(response){
            Storage.keywords=response.data.keywords;
        });
    }]);
