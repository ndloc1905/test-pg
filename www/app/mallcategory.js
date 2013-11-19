var mallCategory = {
	getShoppingMallInfo: function(id){
		
		for(var i=0; i < mobileapp_data.ShoppingMall.length ; i++ ){
			if(mobileapp_data.ShoppingMall[i].id == id)
				return mobileapp_data.ShoppingMall[i];
		}
		return false;
	},
	//display shopping page
	displayShoppingMall: function(shoppingMall,mainCateId){
		var cate_name ="";
		$('div#shop_logo_left').html("<img src='"+ config.pathLogo + shoppingMall.logo +"' title='' alt='' height='50px' />");
		for(var i=0; i < shoppingMall.categories.length ; i++ ){
			if(shoppingMall.categories[i].id == mainCateId) {
				cate_name = shoppingMall.categories[i].multiLanguages[0].title;
				break;	
			}
		}
		$('div.category_header div.cate_name').html(cate_name);
	},
	//display shopping page
	displayCateAndShop: function(shoppingMall,mainCateId){
		var htmlStr = "";
		for(var key in shoppingMall.subcategories) {
			if(key == mainCateId) {
				for(var i=0; i < shoppingMall.subcategories[key].length ; i++ ){
					htmlStr += '<div class="category_item"><div class="cate_name">'+shoppingMall.subcategories[key][i].multiLanguages[0].title+'</div><div class="shop_list"><ul>';
					htmlStr += '</ul></div></div>';
				}
				//
			}
		}
		$('div.category_list').html(htmlStr);
		
	}
};

$('#mallCategoryPage').on('pageshow', function() {
 	var shopId = getUrlVars()["shopId"];
	var mainCateId = getUrlVars()["id"];
	mobileapp_data = JSON.parse(localStorage.getItem('json_data'));
	var shopping = mallCategory.getShoppingMallInfo(shopId);
	mallCategory.displayShoppingMall(shopping,mainCateId);
	mallCategory.displayCateAndShop(shopping,mainCateId);

});



