/**
 * Created with JetBrains WebStorm.
 * User: ty
 * Date: 14-7-24
 * Time: 下午3:10
 * To change this template use File | Settings | File Templates.
 */
var filters=angular.module("filters",[]);
filters.filter("getDate",function(){
    return function(value){
        if(value){
            value=value.split(" ");
            value=value[0];
        }

        return value;
    }
});