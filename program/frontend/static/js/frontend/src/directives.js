/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-24
 * Time: 下午3:10
 * To change this template use File | Settings | File Templates.
 */
var directives=angular.module("directives",["services"]);
directives.directive('ownSrc',function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(function() { return attrs.ownSrc; }, function (newValue,oldValue) {
                if(newValue){
                    element.attr('src', newValue);
                }
            });
        }
    };
});
directives.directive("windowScroll", ["$window","$document","$timeout","$interval","Config","Storage","Article","Video",
    function ($window,$document,$timeout,$interval,Config,Storage,Article,Video) {
        return {
            link: function(scope, element, attrs) {
                angular.element($window).bind("scroll", function() {
                    var end=0;
                    if(Storage.scrollTimer){
                        $timeout.cancel(Storage.scrollTimer);
                        Storage.scrollTimer=null;
                    }

                    Storage.scrollTimer=$timeout(function(){
                        if(Storage.lastShowCount==Config.hasNoMoreFlag){
                            scope.showPaging=true;
                        }else{
                            if(Storage.currentScrollType&&$document[0].body.scrollHeight-$window.innerHeight<=$window.scrollY){

                                end=Storage.lastShowCount+Config.perLoadCount.list;
                                if(end>scope.allItems.length){
                                    end=scope.allItems.length;
                                }
                                scope.items=scope.items.concat(
                                    scope.allItems.slice(Storage.lastShowCount,end));

                                Storage.lastShowCount=end==scope.allItems.length?Config.hasNoMoreFlag:end;

                                if(Storage.lastShowCount==Config.hasNoMoreFlag){
                                    scope.showPaging=true;
                                }
                            }
                        }
                    },200);
                });

                //释放内存
                scope.$on("$destroy",function( event ) {
                    $timeout.cancel( Storage.scrollTimer);
                    Storage.scrollTimer=null;
                    angular.element($window).unbind("scroll");
                });
            }
        }
    }]);
directives.directive("setMapSize",function(){
    return {
        link: function (scope, element, attrs) {

            //需要用到jquery
            if(scope.mainFlags.menuName=="map"){
                element[0].style.height=document.body.scrollHeight-document.getElementById("header").offsetHeight+"px";
                element[0].style.width="100%";
                element[0].style.paddingBottom="0px";
            }else{
                element[0].style.height="auto";
                element[0].style.width="80%";
                element[0].style.paddingBottom="40px";
            }

        }
    };
});
directives.directive("watchHeight",["$window","$document","Config","Storage",
    function($window,$document,Config,Storage){
        return {
            link:function(scope,element,attrs){
                var watch=scope.$watch(function(){
                    return element[0].scrollHeight;
                },function(newValue,oldValue){
                    var end;

                    //防止第一屏不出现滚动条
                    if(Storage.currentScrollType&&newValue!=oldValue&&$document[0].body.scrollHeight<=$window.innerHeight&&
                        Storage.lastShowCount!=Config.hasNoMoreFlag){
                        end=Storage.lastShowCount+Config.perLoadCount.list;
                        if(end>scope.allItems.length){
                            end=scope.allItems.length;
                        }
                        scope.items=scope.items.concat(
                            scope.allItems.slice(Storage.lastShowCount,end));

                        Storage.lastShowCount=end==scope.allItems.length?Config.hasNoMoreFlag:end;
                    }else{
                        if(Storage.currentScrollType&&scope.allItems.length!=0){
                            watch();
                        }
                    }
                });
            }
        }
    }]);
directives.directive("canVisit",["App",function(App){
    return {
        link:function(scope,element,attrs){
            if(!window.Audio){
                App.showBlackOut();
                scope.mainFlags.showTip=true;
            }
        }
    }
}]);