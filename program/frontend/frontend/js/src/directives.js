/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-24
 * Time: 下午3:10
 * To change this template use File | Settings | File Templates.
 */
var directives=angular.module("directives",["services"]);

directives.directive('ellipsis',function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var row=attrs.ellipsis;
            var length=row*20;
            scope.$watch(function() { return element.text(); }, function () {
                var text=element.text();
                if(text.length>length){
                    text=text.substring(0,length)+"...";
                    element.text(text);
                }

                //需要用到jquery
                /*element.ellipsis({
                    row:row
                });*/
            });

        }
    };
});
directives.directive("setMapHeight",function(){
    return {
        link: function (scope, element, attrs) {
            //需要用到jquery
            element.height($("body").height()-180);
        }
    };
});

directives.directive("windowScroll", ["$window","$document","$timeout","$interval","Config","Storage","Post","Town",
    function ($window,$document,$timeout,$interval,Config,Storage,Post,Town) {
        return {
            link: function(scope, element, attrs) {
                angular.element($window).bind("scroll", function() {
                    if(Storage.scrollTimer){
                        $timeout.cancel(Storage.scrollTimer);
                        Storage.scrollTimer=null;
                    }

                    Storage.scrollTimer=$timeout(function(){
                        if(Storage.currentScrollType&&$document[0].body.scrollHeight-$window.innerHeight<=$window.scrollY&&
                            Storage.lastLoadedCount!=Config.hasNoMoreFlag&&Storage.lastLoadedCount!=0&&scope.mainVars.showMain){

                            switch(Storage.currentScrollType){
                                case Config.scrollType.post:
                                    Post.getListPosts(scope.mainVars.searchContent,scope.mainVars.activeCategory).
                                        $promise.then(function(response){
                                            scope.posts=scope.posts.concat(response.data.articles);
                                        });

                                    break;
                                case Config.scrollType.town:
                                    Town.getTownPosts(Storage.currentTownId,scope.mainVars.activeCategory).
                                        $promise.then(function(response){
                                            scope.posts=scope.posts.concat(response.data.articles);
                                        });

                                    break;
                            }
                        }
                    },200);
                });

                //释放内存
                scope.$on("$destroy",function( event ) {
                    $timeout.cancel( Storage.scrollTimer);
                    angular.element($window).unbind("scroll");
                });
            }
        }
    }]);

directives.directive('setScrollTop', ["$window","Storage",function ($window,Storage) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(function() { return element[0].className; }, function (newValue,oldValue) {
                if(newValue.match("ng-hide")==null){
                    //需要用到jquery
                    $window.scrollTo(0,Storage.oldBodyScrollTop);
                }
            });
        }
    };
}]);
directives.directive("watchHeight",["$window","$document","Config","Storage","Post","Town",
    function($window,$document,Config,Storage,Post,Town){
    return {
        link:function(scope,element,attrs){
            var watch=scope.$watch(function(){return element[0].scrollHeight;},function(newValue,oldValue){

                //防止第一屏不出现滚动条
                if(newValue!==0&&$document[0].body.scrollHeight<=$window.innerHeight){
                    switch(Storage.currentScrollType){
                        case Config.scrollType.post:
                            Post.getListPosts(scope.mainVars.searchContent,scope.mainVars.activeCategory).
                                $promise.then(function(response){
                                    scope.posts=scope.posts.concat(response.data.articles);
                                });

                            break;
                        case Config.scrollType.town:
                            Town.getTownPosts(Storage.currentTownId,scope.mainVars.activeCategory).
                                $promise.then(function(response){
                                    scope.posts=scope.posts.concat(response.data.articles);
                                });

                            break;
                    }
                }else{
                    //执行一次，取消watch
                    watch();
                }
            });
        }
    }
}]);
