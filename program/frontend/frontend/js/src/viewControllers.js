/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-24
 * Time: 下午3:12
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-17
 * Time: 下午3:42
 * To change this template use File | Settings | File Templates.
 */
var viewControllers=angular.module("viewControllers",["services","toaster","directives","filters"]);

viewControllers.controller("postList",['$scope',"$interval","Post","Config","Storage",
    function($scope,$interval,Post,Config,Storage){
        $scope.mainVars.showTab=true;
        Storage.currentScrollType=Config.scrollType.post;
        Storage.lastLoadedCount=0;

        $scope.posts=[];
        Post.getListPosts($scope.mainVars.searchContent,$scope.mainVars.activeCategory).$promise.then(function(response){
            $scope.posts=$scope.posts.concat(response.data.articles);
        });


}]);
viewControllers.controller("map",["$scope","$compile","$q","App","Config","CFunctions","Storage","Post","Town",
    function($scope,$compile,$q,App,Config,CFunctions,Storage,Post,Town){

    var markers=[];
    var mobile=CFunctions.checkMobile();
    Storage.map= new BMap.Map("map");
    Storage.map.centerAndZoom("湖南", 11);
    Storage.lastLoadedCount=0;


    if(!mobile["isMobile"]){
        Storage.map.enableScrollWheelZoom();
    }

    $scope.mainVars.showTab=true;
    Storage.currentScrollType="";

    $scope.showSingleTown=function(townId,town,category){
        $scope.mainVars.townDetailUrl=Config.viewUrls.townDetail;
        $scope.mainVars.showTownDetail=true;
        $scope.mainVars.showMain=false;
        $scope.mainVars.activeCategory=category?category:"";
        $scope.mainVars.searchContent=town;
        Storage.currentTownId=townId;
        Storage.map.closeInfoWindow();
    };
    $scope.showSinglePost=function(postId){
        $scope.mainVars.showPopWindow=true;
        $scope.mainVars.popWindowTemplate=Config.viewUrls.postDetail;
        Storage.currentPostId=postId;
        Storage.map.closeInfoWindow();
    };

    function townInfo(data){
        var template;

        //裁剪文字，无法使用ellipsis，因为不知道什么时候加载渲染
        if(data.description.length>100){
            data.description=data.description.substring(0,100)+"...";
        }
        template=$compile("<div class='infoWindow'><h4 class='title'><a href='' ng-click='showSingleTown(\""+data.id+"\",\""+data.name+"\")'>"+data.name+"</a></h4>" +
            "<p class='description'>"+data.description+"</p>" +
            "<ul class='categoryList'>" +
            "<li><a href='' ng-click='showSingleTown(\""+data.id+"\",\""+data.name+"\",\"风景\")'>风 景 （"+data.article_count_group_by_category["风景"]+"）</a></li>"+
            "<li><a href='' ng-click='showSingleTown(\""+data.id+"\",\""+data.name+"\",\"人文\")'>人 文 （"+data.article_count_group_by_category["人文"]+"）</a></li>"+
            "<li><a href='' ng-click='showSingleTown(\""+data.id+"\",\""+data.name+"\",\"物语\")'>物 语 （"+data.article_count_group_by_category["物语"]+"）</a></li>"+
            "<li><a href='' ng-click='showSingleTown(\""+data.id+"\",\""+data.name+"\",\"社区\")'>社 区 （"+data.article_count_group_by_category["社区"]+"）</a></li>"+
            "</ul></div>")($scope);

        //console.log(template);
        return template[0];
    }
    function postInfo(data){
        var template,date;
        if(data.description.length>40){
            data.description=data.description.substring(0,40)+"...";
        }
        date=data.created.split(" ");
        template=$compile("<div class='infoWindow'><a href='' ng-click='showSinglePost(\""+data.id+"\")'>"+
            "<h4 class='title'>"+data.title+"</h4>" +
            "<img id='thumb' class='thumb' src='"+data.profile+"'>" +
            "<div class='infoContainer'>" +
            "<div class='info'><span class='date'>"+date[0]+"</span>" +
            "<span class='address'>"+data.location.city+" "+data.location.name+"</span>"+
            "<span class='category'>"+data.category.name+"</span></div>"+
            "<p class='description'>"+data.description+"</p></div></a></div>")($scope);
        //console.log(string);
        return template[0];
    }

    function openInfoWindow(content ,e){
        var p = e.target;
        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
        var infoWindow = new BMap.InfoWindow(content,{
            enableMessage:false,
            width:280,
            height:0
        });
        Storage.map.openInfoWindow(infoWindow,point); //开启信息窗口

        //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
        if(document.getElementById('thumb')){
            document.getElementById('thumb').onload = function (){
                infoWindow.redraw();
            }
        }



    }
    function addMark(obj,icon){
        var myIcon=new BMap.Icon("images/app/pointIcon"+icon.type+".png", new BMap.Size(icon.width,icon.height)),
            pt=new BMap.Point(obj.longitude,obj.latitude),
            marker=new BMap.Marker(pt,{icon:myIcon}),
            me=this,
            content;

        if(obj.type!="town"){
            markers.push(marker);
        }

        Storage.map.addOverlay(marker);

        if(obj.type=="town"){
            content=townInfo(obj);
        }else{
            content=postInfo(obj);
        }

        marker.addEventListener("click", function(event){
            openInfoWindow(content,event);
        });
    }

    function loadAll(){
        //pad和电脑需要同时加载文章和乡镇
        if(!mobile["isMobile"]||mobile["isPad"]){
            Post.resource.getPostsByGeo(function(response){
                var posts=response.data.articles;
                for (var i= 0,length=posts.length; i < length; i++) {
                    addMark(posts[i],{
                        type:"Small",
                        width:16,
                        height:18
                    });
                }

                //pad上不需要做聚合
                if(!mobile["isMobile"]){
                    var markerClusterer = new BMapLib.MarkerClusterer(Storage.map, {markers:markers});
                }

            });
        }


        Town.resource.query(function(response){
            var towns=Storage.towns=response.data.locations;
            for (var i= 0,length=towns.length; i < length; i++) {
                towns[i]["type"]="town";
                addMark(towns[i],{
                    type:"Big",
                    width:33,
                    height:44
                });
            }
        });
    }

    App.showLoading();
    if(mobile.isMobile){
        if(navigator.geolocation){
            //用html5接口获取当前位置
            navigator.geolocation.getCurrentPosition(function(position){
                Town.resource.query({longitude:position.coords.longitude,latitude:position.coords.latitude},function(response){
                    if(response.data.locations.length!=0){
                        var towns=Storage.towns=response.data.locations;
                        var mapZoom=null;

                        //Storage.map.centerAndZoom(new BMap.Point(position.coords.longitude,position.coords.latitude), 11);
                        Storage.map.panTo(new BMap.Point(position.coords.longitude,position.coords.latitude));


                        for (var i= 0,length=towns.length; i < length; i++) {
                            towns[i]["type"]="town";
                            addMark(towns[i],{
                                type:"Big",
                                width:33,
                                height:44
                            });
                        }

                        if(mobile.isPad){
                            Post.resource.getPostsByGeo({longitude:r.point.lng,latitude:r.point.lat},function(response){
                                var posts=response.data.articles;
                                for (var i= 0,length=posts.length; i < length; i++) {
                                    addMark(posts[i],{
                                        type:"Small",
                                        width:16,
                                        height:18
                                    });
                                }
                            });
                        }

                        //由于没有加载全部数据，当地图缩放的时候需要加载数据
                        Storage.map.addEventListener("zoomend", mapZoom=function(type,target){
                            var zoom=this.getZoom();
                            if(zoom<=7){
                                loadAll();
                                Storage.map.clearOverlays();
                                Storage.map.removeEventListener("zoomend",mapZoom);
                            }
                        });
                    }else{
                        loadAll();
                    }
                });
            },function(error){
                loadAll();
            },{
                timeout: 5000,
                // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                maximumAge: 1800000
            });
        }else{
            loadAll();
        }

    }else{
        //用地图api获取当前位置
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                Town.resource.query({longitude:r.point.lng,latitude:r.point.lat},function(response){
                    if(response.data.locations.length!=0){
                        var markerClusterer=null;
                        var towns=Storage.towns=response.data.locations;
                        var mapZoom=null;

                        //Storage.map.centerAndZoom(new BMap.Point(position.coords.longitude,position.coords.latitude), 11);
                        Storage.map.panTo(new BMap.Point(r.point.lng,r.point.lat));

                        for (var i= 0,length=towns.length; i < length; i++) {
                            towns[i]["type"]="town";
                            addMark(towns[i],{
                                type:"Big",
                                width:33,
                                height:44
                            });
                        }


                        Post.resource.getPostsByGeo({longitude:r.point.lng,latitude:r.point.lat},function(response){
                            var posts=response.data.articles;
                            for (var i= 0,length=posts.length; i < length; i++) {
                                addMark(posts[i],{
                                    type:"Small",
                                    width:16,
                                    height:18
                                });
                            }

                            if(!mobile["isMobile"]){
                                markerClusterer = new BMapLib.MarkerClusterer(Storage.map, {markers:markers});
                            }

                        });

                        //由于没有加载全部数据，当地图缩放的时候需要加载数据
                        Storage.map.addEventListener("zoomend", mapZoom=function(){
                            var zoom=this.getZoom();
                            if(zoom<=7){
                                loadAll();
                                Storage.map.clearOverlays();
                                markerClusterer.clearMarkers();
                                Storage.map.removeEventListener("zoomend",mapZoom);
                            }
                        });

                    }else{
                        loadAll();
                    }
                });
            }else{
                loadAll();
            }
        },{enableHighAccuracy: true});
    }

}]);

viewControllers.controller("postDetail",["$scope","CFunctions","Storage","Post",function($scope,CFunctions,Storage,Post){
    $scope.mainVars.showMain=false;

    $scope.post={};
    Post.resource.get({postId:Storage.currentPostId},function(response){
        $scope.post=response.data.article;
    })
}]);
viewControllers.controller("townDetail",["$scope","Config","Storage","Town","Post",
    function($scope,Config,Storage,Town,Post){
    Storage.currentScrollType=Config.scrollType.town;
    Storage.lastLoadedCount=0;

    $scope.town={};
    for(var i= 0,len=Storage.towns.length;i<len;i++){
        if(Storage.towns[i]["id"]==Storage.currentTownId){
            $scope.town=Storage.towns[i];
            break;
        }
    }

    $scope.returnToMap=function(){
        $scope.mainVars.showMain=true;
        $scope.mainVars.showTownDetail=false;
        $scope.mainVars.townDetailUrl="";
    };
    $scope.posts=[];
    Post.getListPosts($scope.town.name,$scope.mainVars.activeCategory).$promise.then(function(response){
        $scope.posts=$scope.posts.concat(response.data.articles);
    });

}]);






