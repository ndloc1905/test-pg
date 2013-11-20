//
var SMObj;
var geocoder;
var current;
var url = location.href;
var activate = false;
var filter = false;
var weekday = new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

Date.prototype.getWeekday = function() {
	var d = new Date();
	day = d.getDay();
	return weekday[day];
};

//Add custom function to google.maps.LatLng object
if(typeof google != 'undefined') {
	google.maps.LatLng.prototype.distanceFrom = function(latlng) {
		  var lat = [this.lat(), latlng.lat()]
		  var lng = [this.lng(), latlng.lng()]
		  var R = 6378137;
		  var dLat = (lat[1]-lat[0]) * Math.PI / 180;
		  var dLng = (lng[1]-lng[0]) * Math.PI / 180;
		  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		  Math.cos(lat[0] * Math.PI / 180 ) * Math.cos(lat[1] * Math.PI / 180 ) *
		  Math.sin(dLng/2) * Math.sin(dLng/2);
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		  var d = R * c;
		  var dist = Math.round(d);
		  var distkm=(parseInt(dist)/1000).toFixed(1);
		  dist = distkm +" km";
		  return dist;
	};
}

//Add custom function to Array object
Array.prototype.contains = function(k) {
    for(var p in this)
        if(this[p] === k)
            return true;
    return false;
};

var ShoppingMall = function() {
	var displayRows = 3;
	var list = [];
	var total = 0;
	var currentLatlng;
	
	this.init = function() {
		this.displayRows = 3;
		this.loadList();
		this.runEvents();
		this.displayList($('#shopping_mall_list'));
		this.searchStore();
	};
	
	this.displayList = function(container) {
		var html = '';
		var counter = 1;
		var d = new Date();
		var chour = d.getHours();
		var cmunite = d.getMinutes();
		
		for(var key in this.list) {
			if(typeof this.list[key] == 'object') {
				if( counter > this.displayRows) {
					continue;
				}
				if(activate == false) {
					if(this.list[key].is_small == 1) {
						continue;
					}
				}
				var openingTime = this.getOpeningToday(this.list[key].id);
				var time = '';
				if(filter == true) {
					if(openingTime != null) {
						time += openingTime.from.substring(0,5) + ' - ' + openingTime.to.substring(0,5);
						this.list[key].opentime = time;
						this.list[key].from = openingTime.from;
						this.list[key].to = openingTime.to;
						// Check for filter
						if(openingTime.from != null && openingTime.from != '' && openingTime.to != null && openingTime.to != '') {
							var fromhour = parseInt(openingTime.from.substring(0,3));
							var tohour = parseInt(openingTime.to.substring(0,3));
							var frommunite = parseInt(openingTime.from.substring(3,openingTime.from.lastIndexOf(':')));
							var tomunite = parseInt(openingTime.to.substring(3,openingTime.to.lastIndexOf(':')));
							if(fromhour > chour || chour > tohour) {
								continue;
							}
						}
					} else {
						continue;
					}
				} else {
					if(openingTime != null) {
						time += openingTime.from.substring(0,5) + ' - ' + openingTime.to.substring(0,5);
						this.list[key].opentime = time;
						this.list[key].from = openingTime.from;
						this.list[key].to = openingTime.to;
					}
				}
				this.setList(this.list);
				var breakNewLine = '';
				if(this.list[key].distance != '' && this.list[key].opentime != '') {
					breakNewLine = '<br/>';
				}
				var opentime = '';
				if(this.list[key].distance != '' && this.list[key].opentime != '') {
					opentime = '<span class="mall_open_time">' + this.list[key].opentime + '</span>';
				}
				var logo = (this.list[key].logo != null && this.list[key].logo != '') ? '<img src="images/logo/' + this.list[key].logo + '" title="" alt=""/>' : '';
				html += '<div class="shopping_mall">';
				html += '	<a href="./shoppingmall.html?id=' + this.list[key].id + '" rel="external" data-transition="slidefade">';
				html += '      <div class="shopingmall_logo">' + logo + '</div>';
				html += '      <div class="distance">' + this.list[key].distance + breakNewLine + opentime + '</div>';
				html += '      <div class="detail"><img src="images/btn_arrow_right.png" title="" alt="" /></div>';
				html += '    </a>';
				html += '</div>';
				
				counter++;
			}
		}
		if(this.displayRows >= counter || this.displayRows >= total) {
			$('div.viewmore').fadeOut(300);
		} else {
			$('div.viewmore').fadeIn(300);
		}
		if(html == '') {
			html = '<div class="shopping_mall">';
			html += '<i>Shopping mall not found!</i>';
			html += '</div>';
		}
		container.html(html);
	};
	
	this.runEvents = function() {
		self = this;
		$(document).on('click','div.viewmore', function(){
			self.displayRows += 3;
			self.displayList($('#shopping_mall_list'));
		});
		
		$(document).on('click','#clearDetectLocation',function(){
			$('div.your_location span').fadeOut(300, function() {
				$('div.your_location input.location').fadeIn(300, function() {
					$('div.your_location input.location').focus();
					$('div.your_location input.location').select();
					var location = $('div.your_location span').text();
					$('div.your_location input.location').val(location);
				});
			});
		});
		
		$(document).on('mouseup','div#on-off-block div.activate-deactivate',function(){
			var val = $(this).find('#flip-1').val();
			if(val == 'on') {
				activate = true;
			} else {
				activate = false;
			}
			self.updateList();
		});
		
		$(document).on('mouseup','div#on-off-block div.filter',function(){
			var val = $(this).find('#flip-2').val();
			if(val == 'on') {
				filter = true;
			} else {
				filter = false;
			}
			self.updateList();
		});
		// Touch event
		$(document).on('touchstart','#clearDetectLocation',function(){
			$(document).on('touchend','#clearDetectLocation',function(){
				$('div.your_location span').fadeOut(300, function() {
					$('div.your_location input.location').fadeIn(300, function() {
						$(this).focus();
						$(this).select();
						var location = $(this).val();
						$(this).val(location);
					});
				});
			});
		});
		$(document).on('touchstart','div#on-off-block div.activate-deactivate',function(){
			$(document).on('touchend','div#on-off-block div.activate-deactivate',function(){
				var val = $(this).find('#flip-1').val();
				if(val == 'on') {
					activate = true;
				} else {
					activate = false;
				}
				self.updateList();
			});
		});
		
		$(document).on('touchend','div#on-off-block div.filter',function(){
			$(document).on('touchend','div#on-off-block div.filter',function(){
				var val = $(this).find('#flip-2').val();
				if(val == 'on') {
					filter = true;
				} else {
					filter = false;
				}
				self.updateList();
			});
		});
	};
	
	this.updateList = function() {
		if(typeof current != 'undefined') {
			GeolocationService.rebuildList(current);
		} else {
			this.loadList();
		}
		this.displayList($('#shopping_mall_list'));
	};
	
	this.getList = function() {
		return this.list;
	};
	this.setList = function(list) {
		if(typeof list == 'undefined' || list == null) {
			this.list = [];
		} else {
			this.list = list;
		}
	};
	this.add  = function(item) {
		this.list.push(item);
	};
	// Get list of shopping mall and related data
	this.loadList = function() {
		this.setList(null);
		
		for(var key in json_data.ShoppingMall) {
			var item = json_data.ShoppingMall[key];
			
			if(typeof item != 'undefined' && typeof item == 'object') {
				if(typeof item.distance == 'undefined') {
					item.distance = '';
				}
				item.opentime = '';
				item.from = '';
				item.to = '';
				if(activate == false) {
					if(item.is_small == 0) {
						total++;
					} else {
						continue;
					}
				} else {
					total++;
				}
				this.add(item);
			}
		}
	};
	
	// Get opening time of shopping mall by id from json
	this.getOpeningTimeBySMID = function(shoppingMallId) {
		for(var key in this.list) {
			if(parseInt(this.list[key].id) == parseInt(shoppingMallId)) {
				return this.list[key].SMOpeningTime;
			}
		}
		return null;
	};
	
	this.getOpeningToday = function(shoppingMallId) {
		var openingTimeList = this.getOpeningTimeBySMID(shoppingMallId);
		var d = new Date();
		var date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
		if(openingTimeList != null) {
			for(var i=0; i<openingTimeList.length; i++) {
				var holiday = this.getHolidaysById(openingTimeList[i].holiday_id);
				if(openingTimeList[i].holiday_id != '0' && holiday.date == date && d.getWeekday() == openingTimeList[i].weekday) {
					return openingTimeList[i];
				} else if(d.getWeekday() == openingTimeList[i].weekday) {
					return openingTimeList[i];
				}
			}
		}
		return null;
	};
	
	this.getHolidaysById = function(id) {
		for(var key in json_data.Holiday) {
			var holiday = json_data.Holiday[key];
			if(typeof holiday.date != 'undefined' && holiday.date != null) {
				holiday.date = new Date().getFullYear() + holiday.date.substring(4,holiday.date.length);
			}
			if(holiday.id == id) {
				return holiday;
			}
		}
		return null;
	};
	
	// search store
	// Search store in shopping mall
	this.searchStore = function() {
		self = this;
		
		var storeList = this.getDistinctStoreName();
		
		// Check click outside of search autocomplete this will be hide
		document.addEventListener("click", function (e) {
			var level = 0;
			for (var element = e.target; element; element = element.parentNode) {
				if (element.id === 'searchAutocomplete') {
					return true;
				} else if (element.id === 'search_box') {
					return true;
				}
				level++;
			}
			$('#searchAutocomplete').hide();
			$('input.search-store').blur();
		});
		$('#searchAutocomplete').on('click','li',function(){
			var keywordSearch = $(this).text();
			if(keywordSearch == '' || typeof keywordSearch == 'undefined') {
	    		keywordSearch = $(this).val();
	    	}
			
			$('#searchAutocomplete').hide();
			$('input.search-store').focus();
			
			var storeFound = self.checkStoreInSM(keywordSearch);
			var result = self.getSearchResult(storeFound);
	    	result = self.dinstinctObject(result);
	    	self.setList(result);
	    	self.displayList($('#shopping_mall_list'));
	    	return false;
		});
		
		var idex = 0;
		$( "#search_box").on('keyup', 'input.search-store',function(event){
			var html = '';
			if(event.keyCode == 40) {
				$('#search_box div.container-shop-found').on('focus', '#searchAutocomplete li', function() {
				    $this = $(this);
				    $this.addClass('active').siblings().removeClass('active');
				    $this.closest('li.top_search div.container-shop-found').scrollTop($this.index() * $this.outerHeight());
				}).on('keydown', '#searchAutocomplete li', function(e) {
				    $this = $(this);
				    if (e.keyCode == 13) {        
				    	var keywordSearch = $('#searchAutocomplete li.active').text();
				    	if(keywordSearch == '' || typeof keywordSearch == 'undefined') {
				    		keywordSearch = $(this).val();
				    	}
						$('#searchAutocomplete').hide();
						$('input.search-store').focus();
						
						var storeFound = self.checkStoreInSM(keywordSearch);
						var result = self.getSearchResult(storeFound);
				    	result = self.dinstinctObject(result);
				    	self.setList(result);
				    	self.displayList($('#shopping_mall_list'));
				    	
				    	e.preventDefault();
				    	return false;
				    } else if (e.keyCode == 40) {        
				        $this.next().focus();
				        e.preventDefault();
				    	return false;
				    } else if (e.keyCode == 38) {        
				        $this.prev().focus();
				        e.preventDefault();
				    	return false;
				    }
				    
				}).find('#searchAutocomplete li').first().focus();
			}
			
			if (event.keyCode == 13) {        
		    	var keywordSearch = $('#searchAutocomplete li.active').text();
		    	if(keywordSearch == '' || typeof keywordSearch == 'undefined') {
		    		keywordSearch = $(this).val();
		    	}
				$('#searchAutocomplete').hide();
				$('input.search-store').focus();
				
				var storeFound = self.checkStoreInSM(keywordSearch);
				var result = self.getSearchResult(storeFound);
		    	result = self.dinstinctObject(result);
		    	self.setList(result);
		    	self.displayList($('#shopping_mall_list'));
		    	return false;
		    }
			if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 32) {
				keyword = $(this).val().toLowerCase();
				
				if(keyword == '') {
					$('#searchAutocomplete').hide();
				} else {
					$('#searchAutocomplete').show();
				}
				var reindex = 0;
				
				for(var key in storeList) {
					if(typeof storeList[key] == 'string' && storeList[key] != '') {
						var item = storeList[key].toLowerCase();
						if(item.indexOf(keyword) != -1) {
							var indexOf = item.indexOf(keyword);
							var subRealText = storeList[key].substring(indexOf,indexOf + keyword.length);
							var boldText = '<strong>' + subRealText + '</strong>'; 
							if(keyword.length == item.length - 1 || keyword.length == item.length - 2) {
								html += '<li class="active" tabindex="'+(reindex+1)+'">' + storeList[key].replace(subRealText,boldText) + '</li>';
							} else if(keyword.length == item.length) {
								html += '<li class="active" tabindex="'+(reindex+1)+'">' + storeList[key] + '</li>';
							} else  {
								html += '<li class="" tabindex="'+(reindex+1)+'">' + storeList[key].replace(subRealText,boldText) + '</li>';
							}
							reindex++;
							idex++;
						}
					}
				}
				$('#searchAutocomplete').html(html);
				var count = 0;
				$('#searchAutocomplete li.active').each(function(ix){
					count++;
				});
				if(count > 1) {
					$('#searchAutocomplete li').removeClass('active');
				}
				if(reindex == 1) {
					$('#searchAutocomplete').find('li').addClass('active');
				}
			}
		});
	};
	
	// Get all store in shopping malls
	this.getAllStores = function() {
		var stores = [];
		for(var key in json_data.ShoppingMall) {
			if(typeof json_data.ShoppingMall[key] == 'object') {
				if(json_data.ShoppingMall[key].stores) {
					var storeData = json_data.ShoppingMall[key].stores;
					for(var k in storeData) {
						for(var i=0; i<storeData[k].length; i++) {
							var store = storeData[k][i];
							if(typeof store == 'object') {
								store.shopping_mall_id = json_data.ShoppingMall[key].id;
								stores.push(store);
							}
						}
					}
				}
			}
		}
		return stores;
	};
	
	// get distinct store name to use for search autocomplete
	this.getDistinctStoreName = function() {
		var temp = [];
		var stores = this.getAllStores();
		for(var key in stores) {
			var store = stores[key];
			if(typeof store != 'undefined') {
				for(var skey in store.multiLanguages) {
					if(typeof store.multiLanguages[skey] == 'object') {
						if(store.multiLanguages[skey].name) {
							var item = store.multiLanguages[skey].name;
							if(!temp.contains(item)) {
								temp.push(item);
							}
						}
					}
				}
			}
		}
		return temp;
	};
	
	// get distinct store in shopping mall
	this.getDistinctStoreInSM = function() {
		var temp = [];
		var stores = this.getAllStores();
		var newStores = [];
		for(var key in stores) {
			var store = stores[key];
			if(typeof store == 'object') {
				var item = store.id;
				if(!temp.contains(item)) {
					newStores.push(store);
					temp.push(item);
				}
			}
		}
		return newStores;
	};
	// Check store in shopping mall
	this.checkStoreInSM = function(storeName) {
		var storesInSMs = this.getDistinctStoreInSM();
		var stores = [];
		if(!storeName) return null;
		for(var key in storesInSMs) {
			if(typeof storesInSMs[key] == 'object') {
				for(var k in storesInSMs[key].multiLanguages) {
					if(typeof storesInSMs[key].multiLanguages[k] == 'object') {
						var store4Lang = storesInSMs[key].multiLanguages[k];
						var name = store4Lang.name.toLowerCase();
						var storeName = storeName.toLowerCase();
						if(name.indexOf(storeName) != -1) {
							stores.push(storesInSMs[key]);
						}
					}
				}
			}
		}
		
		return stores;
	};
	
	// dinstinct shopping mall
	this.dinstinctObject = function(objects) {
		var temp = [];
		var objs = [];
		if(!objects) return null;
		for(var key in objects) {
			if(typeof objects[key] == 'object') {
				if(!temp.contains(objects[key].id)) {
					temp.push(objects[key].id);
					objs.push(objects[key]);
				}
			}
		}
		return objs;
	};
	
	// get shopping mall result of search by store
	this.getSearchResult = function(stores) {
		var shoppingMalls = [];
		var shoppingMallList = this.getList();
		for(var key in shoppingMallList) {
			if(typeof shoppingMallList[key] == 'object') {
				if(shoppingMallList[key].isCity == 0) {
					for(var k in stores) {
						if(typeof shoppingMallList[key] == 'object') {
							if(shoppingMallList[key].id == stores[k].shopping_mall_id) {
								shoppingMalls.push(shoppingMallList[key]);
							}
						}
					}
				}
			}
		}
		
		return shoppingMalls;
	};
};

// GeolocationService class
var GeolocationService = new function() {
	
	this.initialize = function() {
		if(typeof google != 'undefined') {
			geocoder = new google.maps.Geocoder();
			SMObj = new ShoppingMall();
			GeolocationService.loadCurrentLocation();
			GeolocationService.searchLocation();
			
			SMObj.init();
		}
	};
	
	this.loadCurrentLocation = function() {
		if (navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position){
		    	var latlng =  new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				geocoder.geocode( {'latLng' : latlng}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[1]) {
							// formatted address
							// find country name
							for ( var i = 0; i < results[0].address_components.length; i++) {
								for ( var b = 0; b < results[0].address_components[i].types.length; b++) {

									// there are different types that might hold a
									// city admin_area_lvl_1 usually does in come
									// cases looking for sublocality type will be
									// more appropriate
									if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
										// this is the object you are looking for
										city = results[0].address_components[i];
										GeolocationService.rebuildList(results[0].geometry.location);
										current = results[0].geometry.location;
										break;
									}
								}
							}
							// city data
							$('div.your_location input.location').val(city.long_name);
							$('div.your_location span').html(city.long_name);
							
						} else {
							alert("No results found");
						}
					} else {
						alert("Geocoder failed due to: " + status);
					}
				});
		    }, GeolocationService.handleNoGeolocation);
		    GeolocationService.rebuildList(current);
		} 
	};
	// Function search and check exists location with blur and keypress events
	this.searchLocation = function() {
		// Search location with blur event
		$('input.location').blur(function(event){
			$('#loading').show();
			
			$('div.your_location input.location').fadeOut(300, function() {
				$('div.your_location span').fadeIn(300, function() {
					var location = $('input.location').val();
					if(location != null && location != '') {
						geocoder.geocode( {'address' : location}, function(results, status) {
							if (status == google.maps.GeocoderStatus.OK) {
								if (results[0]) {
									// formatted address
									//alert(results[0].formatted_address);
									// find country name
									for ( var i = 0; i < results[0].address_components.length; i++) {
										for ( var b = 0; b < results[0].address_components[i].types.length; b++) {

											// there are different types that might hold a
											// city admin_area_lvl_1 usually does in come
											// cases looking for sublocality type will be
											// more appropriate
											if (results[0].address_components[i].types[b] == "locality") {
												// this is the object you are looking for
												city = results[0].address_components[i];
												break;
											}
										}
									}
									// city data
									$('div.your_location input.location').val(city.long_name);
									$('div.your_location span').html(city.long_name);
									Util.setLocalStorage(city.long_name);
									current = results[0].geometry.location;
									GeolocationService.rebuildList(current);

								} else {
									alert("No results found");
								}
							} else {
								alert("Geocoder failed due to: " + status);
							}
						});
					} else {
						var cookie = Util.getLocalStorage();//getCookie();
					}
					$('#loading').hide();
				});
			});
			event.preventDefault();
			return false;
		});
		
		// Search location with keypress event (Enter keypress)
		$('div.your_location input.location').keypress(function(event){
			if(event.keyCode == 13) {
				$(this).blur();
				event.preventDefault();
			}
		});
	};
	
	
	this.rebuildList = function(position) {
		// Set distance into locations data
		SMObj.loadList();
		var list = SMObj.getList();
		for(var i = 0; i < list.length; i++) {
			if(typeof SMObj.list[i] == 'object') {
				if(position != null && typeof position != 'undefined') {
					var locTo = new google.maps.LatLng(SMObj.list[i].latitude, SMObj.list[i].longitude);
					var dist = locTo.distanceFrom(position);
					SMObj.list[i].distance = dist;
				}
			}
		}
		if(position != null && typeof position != 'undefined') {
			SMObj.list = Util.sorting(SMObj.list);
		}
		SMObj.displayList($('#shopping_mall_list'));
	};
	
	this.handleNoGeolocation = function(error) {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				GeolocationService.rebuildList(null);
				alert("Error: Location information is permission denied.");
				break;
			case error.POSITION_UNAVAILABLE:
				alert("Error: Location information is unavailable.");
				break;
			case error.TIMEOUT:
				alert("Error: The request to get user location timed out.");
				break;
			case error.UNKNOWN_ERROR:
				alert("Error: An unknown error occurred.");
				break;
		}
	};
};
var Util = new function() {
	this.getLocalStorage = function() {
    	return localStorage.getItem('userlocation');
    };
    this.setLocalStorage = function(value) {
    	localStorage.setItem('userlocation',value);
    };
    
    this.getImageUrl = function(filename) {
    	var baseUrl = Util.getBaseUrl();
    	return baseUrl + filename;
    };
    
    this.getBaseUrl = function() {
    	return url.substring(0, url.indexOf('/', 14)) + '/';
	};
	
	this.compare = function(obj1,obj2) {
		if (parseFloat(obj1.distance) < parseFloat(obj2.distance))
			return -1;
		if (parseFloat(obj1.distance) > parseFloat(obj2.distance))
			return 1;
		return 0;
	}
	// function search array
	this.sorting = function(array) {
		var newArrays = [];
		
		for(var i = 0; i<array.length; i++) {
			if(typeof array[i] != 'undefined') {
				array[i].distance = array[i].distance.replace(' km','');
				newArrays.push(array[i]);
			}
		}
		newArrays = newArrays.sort(Util.compare);
		
		for(var i = 0; i<newArrays.length; i++) {
			if(typeof newArrays[i] != 'undefined') {
				newArrays[i].distance = newArrays[i].distance + ' km';
			}
		}
		return newArrays;
	};
};
