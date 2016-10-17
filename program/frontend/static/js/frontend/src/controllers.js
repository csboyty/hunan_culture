var controllers=angular.module("controllers",["services"]);
controllers.controller("articles",["$scope","$routeParams","Config","Article","Storage",
    function($scope,$routeParams,Config,Article,Storage){
        $scope.mainFlags.menuName=Config.menuName.list;
        $scope.mainFlags.showSearch=true;
        $scope.mainFlags.searchContent="";

        Storage.currentScrollType=Config.scrollType.article;

        //page
        $scope.currentPage=$routeParams.page?$routeParams.page:1;
        $scope.showPaging=false;
        $scope.pageSize=Config.perLoadCount.page;

        $scope.allItems=[];
        $scope.items=[];

        var end;
        Article.resource.query({offset:($scope.currentPage-1)*$scope.pageSize},function(response){
            response=response.data;
            $scope.allItems=response.articles;

            if($scope.allItems.length<=Config.perLoadCount.list){
                end=response.articles.length;
                Storage.lastShowCount=Config.hasNoMoreFlag;
                $scope.showPaging=true;
            }else{
                end=Config.perLoadCount.list;
                Storage.lastShowCount=end;
            }

            $scope.items=$scope.allItems.slice(0,end);

            $scope.total=response.count;
        });
}]);
controllers.controller("articleSingle",["$scope","$routeParams","Storage","Article",function($scope,$routeParams,Storage,Article){
    $scope.mainFlags.menuName="";
    $scope.mainFlags.showSearch=false;
    Storage.currentScrollType="";
    var id=$routeParams.articleId;
    Article.resource.get({id:id},function(response){
        $scope.article=response.data.article;
    });

    $scope.goBack=function(){
        history.go(-1);
    };

    $scope.loadShare();
}]);
controllers.controller("musics",["$scope","$routeParams","Config","Storage","Music",
    function($scope,$routeParams,Config,Storage,Music){
        $scope.mainFlags.menuName=Config.menuName.list;
        $scope.mainFlags.showSearch=false;
        Storage.currentScrollType="";

        $scope.items=[];
        $scope.music=null;
        $scope.currentIndex=-1;
        $scope.isMusicPlay=true;
        $scope.audioTime=0;

        //page
        $scope.currentPage=$routeParams.page?$routeParams.page:1;
        $scope.showPaging=false;
        $scope.pageSize=Config.perLoadCount.page;

        var audio=document.getElementById("audio");

        Music.resource.query({offset:($scope.currentPage-1)*$scope.pageSize},function(response){
            response=response.data;
            $scope.items=response.articles;
            $scope.total=response.count;
            $scope.showPaging=true;
        });

        $scope.loadShare();

        $scope.playMusic=function(index){
            $scope.currentIndex=index;
            $scope.music=$scope.items[index];
            $scope.music.url=$scope.music.assets[0]["media_file"];
        };

        $scope.playOrPause=function(){
            if($scope.isMusicPlay){
                audio.pause();
            }else{
                audio.play();
            }
            $scope.isMusicPlay=!$scope.isMusicPlay;
        };

        audio.addEventListener("timeupdate",function(){
            var totalTime=audio.duration;
            var currentTime=audio.currentTime;
            $scope.audioTime=currentTime/totalTime*100+"%";
            $scope.$digest();
        });

        $scope.prev=function(){
            $scope.currentIndex--;
            if($scope.currentIndex==-1){
                $scope.currentIndex=$scope.items.length-1;
            }

            $scope.music=$scope.items[$scope.currentIndex];
            $scope.music.url=$scope.music.assets[0]["media_file"];
            $scope.isMusicPlay=true;
        };
        $scope.next=function(){
            $scope.currentIndex++;
            if($scope.currentIndex==$scope.items.length){
                $scope.currentIndex=0;
            }

            $scope.music=$scope.items[$scope.currentIndex];
            $scope.music.url=$scope.music.assets[0]["media_file"];
            $scope.isMusicPlay=true;
        };
}]);
controllers.controller("videos",["$scope","$routeParams","Config","Video","Storage",
    function($scope,$routeParams,Config,Video,Storage){

        $scope.mainFlags.menuName=Config.menuName.list;
        $scope.mainFlags.showSearch=false;
        Storage.currentScrollType=Config.scrollType.video;

        //page
        $scope.currentPage=$routeParams.page?$routeParams.page:1;
        $scope.showPaging=false;
        $scope.pageSize=Config.perLoadCount.page;

        $scope.allItems=[];
        $scope.items=[];

        var end;
        Video.resource.query({offset:($scope.currentPage-1)*$scope.pageSize},function(response){
            response=response.data;
            $scope.allItems=response.articles;

            if($scope.allItems.length<=Config.perLoadCount.list){
                end=response.articles.length;
                Storage.lastShowCount=Config.hasNoMoreFlag;
                $scope.showPaging=true;
            }else{
                end=Config.perLoadCount.list;
                Storage.lastShowCount=end;
            }

            $scope.items=$scope.allItems.slice(0,end);

            $scope.total=response.count;
        });
}]);
controllers.controller("videoSingle",["$scope","$routeParams","Storage","Video",function($scope,$routeParams,Storage,Video){
    $scope.mainFlags.menuName="";
    $scope.mainFlags.showSearch=false;
    Storage.currentScrollType="";

    $scope.goBack=function(){
        history.go(-1);
    };

    var id=$routeParams.videoId;
    Video.resource.get({id:id},function(response){
        $scope.video=response.data.article;
        $scope.video.url=$scope.video.assets[0]["media_file"];

        var playerSrc="static/js/frontend/lib/sewise/player/sewise.player.min.js?server=vod&type=m3u8&videourl="+
            $scope.video.url+"&&autostart=false&starttime=0&lang=zh_CN&title="+
            $scope.video.title+"&buffer=5&claritybutton=disable&skin=vodFlowPlayer";
        var script=document.createElement("script");
        script.src=playerSrc;
        document.getElementById("playerContainer").appendChild(script);
    });


    $scope.loadShare();
}]);
controllers.controller("map",["$scope","$location","$compile","$timeout","App","Config","CFunctions","Storage","Music","Video","Article",
    function($scope,$location,$compile,$timeout,App,Config,CFunctions,Storage,Music,Video,Article){

        $scope.mainFlags.menuName=Config.menuName.map;
        $scope.mainFlags.showSearch=false;
        Storage.currentScrollType="";
        $scope.music=null;
        $scope.musics=[];
        $scope.articles=[];
        $scope.isMusicPlay=false;
        $scope.videos=[];
        var audio =document.getElementById("audio"),markers=[],map,markerClusterer;

        function createInfo(data,type){
            var template;
            switch(type){
                case "music":
                    template=$compile('<div class="infoWindow infoWindow1">' +
                        '<a href="" ng-click="clickH(\''+type+'\','+data.id+')">' +
                        '<img id="thumb" class="thumb" src="'+data.profile+'"/>' +
                        '<span class="control" ng-class="{pause:isMusicPlay,play:!isMusicPlay}">播放</span>'+
                        '<div class="musicProcess">'+
                        '<div class="musicProcessValue" ng-style="{width:audioTime}"></div>'+
                        '</div>'+
                        '<div class="info"><div class="left">'+
                        '<time class="date">'+data.author+'</time>'+
                        '<span class="address">'+data.location.city+' '+data.location.name+'</span></div>'+
                        '<p class="excerpt right">'+data.description+'</p>'+
                        '</div></a></div>')($scope);
                    break;
                case "video":
                    template=$compile('<div class="infoWindow infoWindow2">' +
                        '<a href="videos/'+data.id+'" target="_blank" ng-click="clickH(\''+type+'\','+data.id+')">' +
                        '<img id="thumb"  class="thumb" src="'+data.profile+'"/>'+
                        '<div class="info"><div class="left">'+
                        '<span class="address">'+data.location.city+' '+data.location.name+'</span></div>'+
                        '<p class="excerpt right">'+data.description+'</p>'+
                        '</div></a></div>')($scope);
                    break;
                case "article":
                    template=$compile('<div class="infoWindow">' +
                        '<a href="articles/'+data.id+'" target="_blank" ng-click="clickH(\''+type+'\','+data.id+')">' +
                        '<img id="thumb"  class="thumb" src="'+data.profile+'"/>'+
                        '<div class="info"><div class="left">'+
                        '<span class="category">'+data.category.name+'</span><time class="date">'+data.date_add+'</time>'+
                        '<span class="address">'+data.location.city+' '+data.location.name+'</span></div>'+
                        '<p class="excerpt right">'+data.description+'</p>'+
                        '</div></a></div>')($scope);
                    break;
            }

            return template[0];
        }

        function openInfoWindow(content,title,e){
            var p = e.target;
            var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
            var infoWindow = new BMap.InfoWindow(content,{
                title:title,
                enableMessage:false,
                width:300,
                height:0
            });

            infoWindow.addEventListener("close",function(){
                $scope.isMusicPlay=false;
                $scope.music=null;
                audio.pause();

                $scope.$digest();
            });
            map.openInfoWindow(infoWindow,point); //开启信息窗口

            //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
            if(document.getElementById('thumb')){
                document.getElementById('thumb').onload = function (){
                    infoWindow.redraw();
                }
            }
        }
        function addMark(obj,type){
            var myIcon=new BMap.Icon("static/images/frontend/app/iconMap"+type+".png", new BMap.Size(27,45)),
                pt=new BMap.Point(obj.longitude,obj.latitude),
                marker=new BMap.Marker(pt,{icon:myIcon}),
                content;

            markers.push(marker);

            map.addOverlay(marker);

            content=createInfo(obj,type);

            marker.addEventListener("click", function(event){
                openInfoWindow(content,obj.title,event);
            });
        }

        function loadAll(){
            //pad和电脑需要同时加载文章和乡镇
             Article.resource.getAllInMap(function(response){
                 response=response.data;
                 var items=response.articles;
                 for (var i= 0,length=items.length; i < length; i++) {
                     addMark(items[i],"article");
                 }

                 if(markers.length!=0){
                     markerClusterer = new BMapLib.MarkerClusterer(map, {markers:markers});
                 }

            });


            Video.resource.getAllInMap(function(response){
                response=response.data;
                var items=response.articles;
                for (var i= 0,length=items.length; i < length; i++) {
                    addMark(items[i],"video");
                }
            });

            Music.resource.getAllInMap(function(response){
                response=response.data;
                var items=$scope.musics=response.articles;
                for (var i= 0,length=items.length; i < length; i++) {
                    addMark(items[i],"music");
                }
            });


        }

        App.showLoading();
        var timer=$timeout(function(){
            map = new BMap.Map("map");
            map.centerAndZoom("湖南", 11);
            map.enableScrollWheelZoom(true);


            //用地图api获取当前位置
            var geolocation = new BMap.Geolocation();
            geolocation.getCurrentPosition(function(r){
                if(this.getStatus() == BMAP_STATUS_SUCCESS){
                    map.panTo(new BMap.Point(r.point.lng,r.point.lat));

                }

                loadAll();
            },{enableHighAccuracy: true});
        },100,false);

        $scope.clickH=function(type,id){
            switch(type){
                case "music":
                    if(!$scope.music){
                        $scope.music=CFunctions.searchInArray($scope.musics,id,"id");
                        $scope.music.url=$scope.music.assets[0]["media_file"];
                    }else{
                        if($scope.isMusicPlay){
                            audio.pause();
                        }else{
                            audio.play();
                        }
                    }

                    $scope.isMusicPlay=!$scope.isMusicPlay;
                    break;
                case "video":
                    $location.path("/videos/"+id);
                    break;
                case "article":
                    $location.path("/articles/"+id);
                    break;
            }
        };

        audio.addEventListener("ended",function(){
            $scope.isMusicPlay=!$scope.isMusicPlay;
            $scope.audioTime=0;
            $scope.$digest();
        });

        audio.addEventListener("timeupdate",function(){
            var totalTime=audio.duration;
            var currentTime=audio.currentTime;
            $scope.audioTime=currentTime/totalTime*100+"%";
            $scope.$digest();
        });
}]);

controllers.controller("search",["$scope","$routeParams","Config","Article","Storage",
    function($scope,$routeParams,Config,Article,Storage){
        $scope.mainFlags.menuName=Config.menuName.list;
        $scope.mainFlags.showSearch=true;

        Storage.currentScrollType=Config.scrollType.article;

        //page
        $scope.currentPage=$routeParams.page?$routeParams.page:1;
        $scope.showPaging=false;
        $scope.pageSize=Config.perLoadCount.page;

        $scope.allItems=[];
        $scope.items=[];

        var end;
        Article.resource.query({keyword:$scope.mainFlags.searchContent,offset:($scope.currentPage-1)*$scope.pageSize},function(response){
            response=response.data;
            $scope.allItems=response.articles;

            if($scope.allItems.length<=Config.perLoadCount.list){
                end=response.articles.length;
                Storage.lastShowCount=Config.hasNoMoreFlag;
                $scope.showPaging=true;
            }else{
                end=Config.perLoadCount.list;
            }

            $scope.items=$scope.allItems.slice(0,end);

            $scope.total=response.count;
        });
    }]);