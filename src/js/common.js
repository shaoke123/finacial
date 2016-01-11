var aBook = aBook || {};

aBook.common = (function() {
	var navTab;

	function createNavTab() {
		navTab = new NavTab({
			container: $(".main-content-head"),
			activeStyle: "tabNav-active",
			iframe: $("#main-content-iframe")
		});

		//添加首页标签
		navTab.addTab({
			tabText: '<span>首页</span>',
			id: "index",
			tabToken: "index",
			hasCloseBtn: false
		});


		$.ajax({
			url:'/finacial/src/js/testxml.xml',
			type:"GET",
			dataType:'xml',
			async: false,
			success:function(xml){
				$(xml).find("first").each(function() {
					var field = $(this);
					var dataType = field.attr("name");
					var dataId=field.attr("id")
					var div= [
						'<ul class="sideMenu-subBlock">'+
						'<a href="#" data-tab="'+dataId+'">'+dataType+
						'</a>'+
						'</ul>'
					];
					$(".main-content").append(div);

				});

			}
		});



		//jQuery('iframe').contents().find('.sideMenu-subBlock a').click(function(e) {
		$('.sideMenu-subBlock a').click(function(e) {

			$.ajax({
				url:'/finacial/src/js/testxml.xml',
				type:"GET",
				dataType:'xml',
				async: false,
				success:function(xml){

					$(xml).find("first").each(function() {
						var field = $(this);
						var dataType = field.children("second").text();
						$(".main-content").html("");
						var div= [
							'<ul class="sideMenu-subBlock">'+
							'<a href="#">'+dataType+
							'</a>'+
							'</ul>'
						];
						$(".main-content").append(div);

					});

				}
			});


			var tabToken = $(this).attr("data-tab");
			var href = $(this).attr("href");
			var contentBox = $('.main-content-box[data-tab-content=' + tabToken + ']');
			addNavTabItem($(this));

			if (contentBox.length > 0) {
				changeContent($(this));
				contentBox.find("iframe").attr("src", href);
				return;
			}
			if ($(".tab-item[data-menuid=" + $(this).attr("id") + "]").length === 0) {
				$(".main-content-box:last").show();
				return;
			}
			addNavTabItem($(this));
			createContentBox(tabToken, href);
		});
	}


	function changeContent(triggerEle) {
		var flag = triggerEle.attr("data-tab");
		$(".main-content-box").hide();
		$(".main-content-box[data-tab-content=" + flag + "]").show();
		handleIframeTabLink();
	}
	
	function createContentBox(tabToken, src, callback) {
		if ($('.main-content-box[data-tab-content=' + tabToken + ']').length > 0) {
			return;
		}
		var contentBox = [
		                  '<div class="main-content-box" data-tab-content="' + tabToken + '">',
		                  		'<iframe class="main-content-iframe" width="100%" height="187px" frameborder="0" scrolling="no" src="' + src + '"></iframe>',
		                  '</div>'
		                  ];
		$('.main-content-box').hide();
		$(".main-content").append(contentBox.join(""));
		$(".main-content-iframe:visible").css("height", $(window).height());
		$(".main-content-iframe:visible").load(function() {
			handleIframe();
			if (typeof callback === "function") {
				callback();
			}
			if ($(this).contents().find(".sidebar").length > 0) {
				location.reload();
			}
		});
	}
	function getTabText(ele) {
		var myTabText;
		if (ele.attr("data-tabText")) {
			myTabText = ele.attr("data-tabText");
		} else {
			myTabText = ele.contents().filter(function() {
				return this.nodeType === 3
			}).text();
		}
		return myTabText;
	}
	
	function addNavTabItem(linkEle, tabText) {
		var id = linkEle.attr("id");
		//如果点击的菜单的标签页已经打开了，则切换到对应的标签，否则增加一个新的标签。
		if (navTab.tabs[id]) {
			var targetTab = $("[data-menuid='" + id + "']");
			targetTab.click();
		} else {
			navTab.addTab({
				tabText: tabText || getTabText(linkEle),
				id: id,
				tabToken: linkEle.attr("data-tab"),
				hasCloseBtn: true	
			});
		}
	}
	
	function addTab(text, id, tabToken, src, callback) {
		navTab.addTab({
			tabText: text,
			id: id,
			tabToken: tabToken,
			hasCloseBtn: true
		});
		createContentBox(tabToken, src, callback)
	}
	
	function closeTab(id) {
		var targetTab = navTab.tabs[id];
		targetTab.closeTab(targetTab.closeBtn);
	}
	

	

	function setTableStripes(type) {
		var target = $(".table-stripes");
		if (target.hasClass("stripes-odd")) {
			target.children("tbody").children("tr:odd").addClass("tr-stripes");
		} else {
			target.children("tbody").children("tr:even").addClass("tr-stripes");
		}
	}
	
	function eliminateItemMargin(itemClass, step) {
		var items = $(itemClass);
		for (var i = step - 1; i < items.length; i += step) {
			items.eq(i).addClass("no-margin-r");
		}
	}

	function setPageContentHeight(target) {
		if (target.length === 0) return;
		var iframeH = $(".main-content-iframe:visible").outerHeight();
		var targetOffsetT = target.offset().top;
		target.css({
			"min-height": iframeH - targetOffsetT
		});
	}
	
	function setPageMinHeight(target, related) {
		var winHeight = $(parent).height();
		var wrap = $(".wrap", parent.document);
		var wrapMT = parseInt(wrap.css("margin-top"));
		var wrapMB = parseInt(wrap.css("margin-bottom"));
		var main = $(".main-content", parent.document);
		var mainPaddingT = parseInt(main.css("padding-top"));
		var mainPaddingB = parseInt(main.css("padding-bottom"));
		var iframeOffsetT = $(".main-content-iframe:visible", parent.document).offset().top;
		var targetOffsetT = target.offset().top;
		var targetPT = parseInt(target.css("padding-top"));
		var targetPB = parseInt(target.css("padding-bottom"));
		var relatedH = 0;
		if (related) {
			relatedH = related.outerHeight() + parseInt(related.css("margin-top")) + parseInt(related.css("margin-bottom"));
		}
		var targetHeight = winHeight - wrapMT - wrapMB - mainPaddingT - mainPaddingB - iframeOffsetT - targetOffsetT - relatedH - targetPT - targetPB - 5;
		target.css("min-height", targetHeight);
	}
	
	function handleIframeTabLink() {
		var link = $(".main-content-iframe:visible").contents().find(".createNavTab");
		link.click(function(e) {
			e.preventDefault();
			var tabToken = $(this).attr("data-tab");
			addNavTabItem($(this));
			if ($('.main-content-box[data-tab-content=' + tabToken + ']').length > 0) {
				changeContent($(this));
				return;
			}
			
			createContentBox($(this).attr("id"), $(this).attr("href"));
		});
		$(".main-content-iframe:visible").contents().find("body").css("background", "none");
		//setPageContentHeight($(".main-content-iframe:visible").contents().find(".page-main-content"));
	}
	
	function handleIframe() {
		setIframeHeight($(".main-content-iframe:visible"));
		handleIframeTabLink();
	}
	
	function refreshTabPage(id, src) {
		var targetTab = $("[data-menuid='" + id + "']");
		var targetIframe = $(".main-content-box[data-tab-content=" + id + "]").children("iframe");
		if (targetTab.length === 0 || targetIframe.length === 0) return;
		targetTab.click();
		targetIframe.attr("src", src);
	}
	

	
	return $.extend({
		init: function() {
			createNavTab();
			setTableStripes();
		},
		setTableStripes: setTableStripes,
		eliminateItemMargin: eliminateItemMargin,
		addNavTab: addNavTabItem,
		addTab: addTab,
		closeTab: closeTab,
		changeContent: changeContent,
		setPageMinHeight: setPageMinHeight,
		refreshTabPage: refreshTabPage
	}, PubSub);
})();



//导航标签页
function NavTab(opts) {
	this.container = opts.container;
	this.activeStyle = opts.activeStyle;
	this.iframe = opts.iframe;
	this.tabs = {};
	this.html = $('<div class="tabNav-wrap clearfix"><ul class="tabNav-items float-l"></ul></div>');
	this.currentAddedTab = null;
	this.currentActiveTab = null;
	this.init();
}
NavTab.prototype = $.extend({
	init: function() {
		this.container.append(this.html);
	},
	addTab: function(opts) {
		var me = this;
		this.currentAddedTab = new NavTabItem({
			tabBox: this,
			tabText: opts.tabText,
			id: opts.id,
			hasCloseBtn: opts.hasCloseBtn
		});
		this.tabs[opts.id] = this.currentAddedTab;
		this.bindItemCustomEvents(opts.src, opts.tabToken);
		this.currentAddedTab.createHtml();
		this.currentAddedTab.handleEvents();
		
	},
	
	removeTab: function(id) {
		delete this.tabs[id];
		this.currentAddedTab.remove("closeNavTab", this.removeTab);
	},
	setAcitveStyle: function(tabEle) {
		if (this.currentActiveTab) {
			this.currentActiveTab.removeClass(this.activeStyle);
		}
		this.currentActiveTab = tabEle;
		this.currentActiveTab.addClass(this.activeStyle);
	},
	setActiveMenu: function(id) {
		var menu = $("#" + id).parent();
		$(".subMenu-active").removeClass("subMenu-active");
		menu.addClass("subMenu-active");
	},
	setClosedActiveTab: function(tabEle) {
		var targetTab;
		if (!tabEle.hasClass("tabNav-active")) return;
		if (tabEle.prev().length > 0) {
			targetTab = tabEle.prev();
		} else {
			targetTab = tabEle.next();
		}
		targetTab.click();
	},
	
	removeContentBox: function(tabEle) {
		var flag = tabEle.attr("data-tab");
		$(".main-content-box[data-tab-content=" + flag + "]").remove();
	},
	bindItemCustomEvents: function(src, tabToken) {
		var me = this;
		this.currentAddedTab.on("tabAdded", function(e, tabEle, id) {
			me.setAcitveStyle(tabEle);
			//tabEle.attr("data-src", src);
			tabEle.attr("data-menuId", id);
			tabEle.attr("id", id);
			tabEle.attr("data-tab", id);
		});
		this.currentAddedTab.on("closeNavTab", function(e, tabEle, id) {
			me.removeTab(id);
			me.setClosedActiveTab(tabEle);
			me.removeContentBox(tabEle);
		});
		this.currentAddedTab.on("tabClick", function(e, tabEle, id) {
			me.setAcitveStyle(tabEle);
			me.setActiveMenu(id);
			aBook.common.changeContent(tabEle);
		});
		
	}
}, PubSub);

function NavTabItem(opts) {
	this.tabBox = opts.tabBox;
	this.tabText = opts.tabText;
	this.hasCloseBtn = opts.hasCloseBtn;
	this.id = opts.id;
	this.itemHtml = "";
	this.closeBtn = $('<span class="tabNav-item-close" title="关闭"></span>');
	this.init();
}
NavTabItem.prototype = $.extend({
	init: function() {
		//this.createHtml();
		//this.handleEvents();
	},
	createHtml: function() {
		this.itemHtml = $('<li class="tab-item hide"><span class="tab-item-text">' + this.tabText+ '</span></li>');
		if (this.hasCloseBtn) {
			this.itemHtml.append(this.closeBtn);
		}
		this.tabBox.html.find(".tabNav-items").append(this.itemHtml);
		if (!this.addable()) {
			Widget.prodialog.alert("提示框", "当前标签已满，请关闭部分标签后再打开！");
			this.closeTab(this.itemHtml.find(".tabNav-item-close"));
			return;
		}
		this.itemHtml.show();
		this.trigger("tabAdded", this.itemHtml, this.id);
	},
	addable: function() {
		var containerWidth = this.tabBox.html.width();
		var itemsTotalWidth = 0;
		this.tabBox.html.find(".tab-item").each(function() {
			itemsTotalWidth += $(this).outerWidth();
		});
		if (itemsTotalWidth > containerWidth && containerWidth > 0) {
			return false;
		}
		return true;
	},
	closeTab: function(trigger) {
		if ($(".tab-item").length === 1) {
			Widget.prodialog.alert("提示框", "最后一个标签不能关闭！");
			return;
		}
		this.trigger("closeNavTab", trigger.parent(), this.id);
		trigger.parent().remove();
	},
	
	handleEvents: function() {
		var me = this;
		this.closeBtn.click(function(e) {
			e.stopPropagation();
			me.closeTab($(this));
		});
		this.itemHtml.click(function() {
			me.trigger("tabClick", $(this), me.id);
		});
	}
}, PubSub);

//普通标签页
var Tab = function(opts) {
	this.navElements = opts.navElements;
	this.navClassName = opts.navClassName;
	this.initTab = opts.initTab || $(this.navElements).eq(0);
	this.currentTab = null;
	this.currentContent = null;
	Observer.call(this);
	this.init();
}
extend(Tab, Observer);
Tab.prototype.init = function() {
	this.currentTab = this.initTab;
	this.changeTab(this.initTab);
	this.handleEvents();
};
Tab.prototype.handleEvents = function() {
	var me = this;
	$("body").on("click", this.navElements, function() {
		me.changeTab($(this));
	});
};
Tab.prototype.changeTab = function(triggerEle) {
	var tabFlag = triggerEle.attr("data-tab");
	this.currentTab.removeClass(this.navClassName);
	triggerEle.addClass(this.navClassName);
	this.currentTab = triggerEle;
	this.currentContent ? this.currentContent.hide() : "";
	this.currentContent = $('[data-tab-content=' + tabFlag + ']');
	this.currentContent.show();
	this.trigger("change", triggerEle, this.currentContent);
};


$(function() {
	aBook.common.init();
	//document.getElementById("main-content-iframe").onload = function() {
     //  aBook.common.init();
	//}
});


