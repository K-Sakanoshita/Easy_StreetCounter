/*
	Easy StreetCounter
	* copyright by K.Sakanoshita
	* Licence: MIT
*/
"use strict";

// Global Variable
const GET_Url 	= "https://script.google.com/macros/s/AKfycby5AYueVHDlUph0Ag0doToykrKj2B_y3S04tGFylDPLezIWTKM/exec";
const POST_Ok	= "登録に成功しました。";
const POST_Ng   = "登録エラーです。もう一度やり直してください。";
var map;
var osm;					// OSM地図
var ort;					// オルソ化航空写真
var marker;					// マーカーレイヤー
var latlng;					// マーカーの緯度経度
var L_Sel;
var Layers;					// レイヤーの一覧(地理院地図、OSMなど)
var contLayer = {};			// 
var contents;

// initialize leaflet
$(function(){
	osm = L.tileLayer(
		'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
		maxZoom: 19
	});
	ort = L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg', {
		minZoom: 5, maxZoom: 18, 
		attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    });
	Layers = { 'OpenStreetMap': osm,'地理院（写真）': ort };
	map = L.map('mapid', {zoomControl: false,layers: [osm]});
	map.locate({setView: true});
	map.on('moveend', function(){
		map.off('moveend');
		map.setZoom(18);
	});
	L.control.zoom({})

	// クリックしたらポップアップを表示する
	map.on('click', function(e) {
		if (marker !== undefined)
			return;
		marker = L.marker(e.latlng).addTo(map);
		latlng = e.latlng;
		marker.bindPopup($('#PopUp').html(), { keepInView: true,autoPanPadding: [2, 2],closeOnClick: false }).openPopup();
		marker.on("popupclose", function(e){
			map.removeLayer(marker);
			marker = undefined;
		});
	});
});

// ポップアップ内容の読み込み
$(document).ready(function() {
	$.ajaxSetup({cache: false});
	$('#PopUp').load('PopUp.html');
});

// サーバーにデータを投稿する
function PostData(commit){
	return new Promise(function(resolve,reject){
		let date = new Date();
		commit["lat"] = latlng.lat;
		commit["lng"] = latlng.lng;
		commit["timestamp"] = formatDate(date,"YYYY/MM/DD hh:mm:ss");
		$.ajax({
			type : "get",
			url : GET_Url + '?json=' + JSON.stringify(commit),
			dataType: "jsonp",
			jsonpCallback: 'GDocReturn'
		})
		.then(function(json){
			marker.closePopup();
			alert (POST_Ok);
			resolve();
		},function(json){
			alert(POST_Ng);
			reject(error);
		});
	});
}

// 日時フォーマット関数
function formatDate (date, format) {
	format = format.replace(/YYYY/g, date.getFullYear());
	format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
	format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
	format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
	format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
	format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
	return format;
};
