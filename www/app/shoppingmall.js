var shoppingMall = {
	"id":"",
	"name":"",
	"logo":"",
	"tel":"",
	"zipcode":"",
	"website":"",
	"email":"",
	"address":"",
	"location":"",
	"train_station":"",
	"show_level":"",
	"is_small":"",
	"sorting":"",
	"latitude":"",
	"longitude":"",
	"created_date":"2013-10-14 00:00:00",
	"modified_date":"2013-10-14 00:00:00",
	"categories":[],
	"services":[],
	//get shopping mall information by id
	getShoppingMallInfo: function(id,mobileapp_data){
		for(var i=0; i < mobileapp_data.ShoppingMall.length ; i++ ){
			if(mobileapp_data.ShoppingMall[i].id == id)
				return mobileapp_data.ShoppingMall[i];
		}
		return false;
	},
	//display shopping page
	displayShoppingMall: function(shoppingMall){
		$('div#shop_logo').html("<img src='"+ config.pathLogo + shoppingMall.logo +"' title='' alt='' height='50px' />");
	},
	//display shopping mall contact page
	displaySMContact: function(shoppingMall){
		$('div#contactInfo').html(shoppingMall.name + "<br><br>" + shoppingMall.address + "<br><br>" + shoppingMall.tel + "<br><br>" + shoppingMall.website);
	},
	//display shopping mall openning time page
	displaySMOpenning: function(shoppingMall){
		var opentime = [];
		for(var i=0; i < shoppingMall.SMOpeningTime.length ; i++ ){
			if(shoppingMall.SMOpeningTime[i].holiday_id==0){
				opentime.push(shoppingMall.SMOpeningTime[i]);				
			}
		}
		//console.log(JSON.stringify(opentime));
		
		var htmlStr = '<div class="opening_time"><div class="box_title">Öffnungszeiten</div><div class="box_content"><div class="table">';
		for(var i=0; i < opentime.length ; i++ ){
			if(opentime[i].status=='open'){
				htmlStr += '<div class="row"><div class="leftcell">'+opentime[i].weekday+'</div><div class="rightcell">'+opentime[i].from + '-' + opentime[i].to+'</div></div>';
			}
			else{
				htmlStr += '<div class="row"><div class="leftcell">'+opentime[i].weekday+'</div><div class="rightcell">geschlossen</div></div>';
			}
		}
		//console.log(htmlStr);
		$('div#openningTimeInfo').html(htmlStr);
	},
	//display shopping a to z page
	displaySMShopAZ: function(shoppingMall){
		var htmlStr = "";
		if(shoppingMall.stores){
			$.each(shoppingMall.stores, function() {
				for(var i=0; i < this.length ; i++ ){
					htmlStr += this[i].multiLanguages[i].name + "<br>" + this[i].phone_number + "<br>" + this[i].email + "<br>" + this[i].website+ "<br><br>";
				}
			});
			$('div#shopAZInfo').html(htmlStr);
		}
	},	
	//display shopping main cate page
	displaySMMainCate: function(shoppingMall){
		var htmlStr = "";
		if(shoppingMall.categories){
			for(var i=0; i < shoppingMall.categories.length ; i++ ){
				htmlStr += '<li><a href="./mallcategory.html?id='+shoppingMall.categories[i].id+'&shopId='+shoppingMall.id+'" rel="external" ><div class="cate_logo"><img src="images/ico_shopping.png" title="" alt="" /></div><div class="shop_cate_name">'+shoppingMall.categories[i].multiLanguages[0].title+'</div></a></li>';
			}
			$('ul#main_cate_list').html(htmlStr);
			$('ul#main_cate_list').append('<li class="service"><a href="#service_mall" title="" alt="" >                    <div class="cate_logo"><img src="images/ico_service.png" title="" alt="" /></div><div class="shop_cate_name">Service</div></a></li>')
		}
	},
	//display shopping service page
	displaySMService: function(shoppingMall){
		var htmlStr = "";
		if(shoppingMall.services){
			for(var i=0; i < shoppingMall.services.length ; i++ ){
				if(shoppingMall.services[i].service_offered=="NO"){
					htmlStr += '<li><a href="#" rel="external" ><div class="shop_logo"><img src="images/serv_still.png" title="" alt="" /></div><div class="shop_name">'+shoppingMall.services[i].service_name+'</div></a></li>';
				}
			}
			$('ul#service_list').html(htmlStr);
		}
	}
};

$('#shoppingMallPage').on('pageshow', function() {
	
 	var id = getUrlVars()["id"];
	
	//var json_data_test = {"abc":[{"abc":"123","def":"456"}],"bcd":[{"abc1":"1231","def1":"4561"}]};
	//window.localStorage.setItem( 'json_data_test',JSON.stringify(json_data_test) );
		
	mobileapp_data = JSON.parse(window.localStorage.getItem('json_data'));
	//mobileapp_data_test = JSON.parse(window.localStorage.getItem('json_data_test'));	
	
	//alert(JSON.stringify(mobileapp_data));
	//alert(JSON.stringify(mobileapp_data_test));
	var shopping = shoppingMall.getShoppingMallInfo(id,mobileapp_data);
	shoppingMall.displayShoppingMall(shopping);
	shoppingMall.displaySMContact(shopping);
	shoppingMall.displaySMOpenning(shopping);
	shoppingMall.displaySMShopAZ(shopping);
	shoppingMall.displaySMMainCate(shopping);
	shoppingMall.displaySMService(shopping);
});




