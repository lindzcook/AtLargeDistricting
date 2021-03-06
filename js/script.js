(function() {
	var wht = "#344A93", blk = "#E6550D";
	$('#map').load('assets/ga_counties.svg', null, function(data) {
		$.ajax({
			type: "GET",
			url: "data/districts.json",
			dataType: "json",
			success: setUp
		});

		function setUp(json){
			//build data table HTML
			$.getJSON("data/votingtable.json" , function(data){
				var tbl_body = "";
				$.each(data, function(){
					var tbl_row = "";
					$.each(this, function(k , v){
						tbl_row += "<td>" + v + "</td>";
					});
					tbl_body += "<tr>" + tbl_row + "</tr>";
				});
				$("#table tbody").html(tbl_body);
			});

			json.forEach(function(county){
				var me = $("#"+county.cID);
				me.attr("class", "county "+county.category);
				var alpha = Math.abs(county.representation/40);
				if(county.representation <= -10){ //placeholder value, need better buckets from Jeff
					me.css({'fill': wht, 'fill-opacity': alpha});
				} else if (county.representation >= 10){
					me.css({'fill': blk, 'fill-opacity': alpha});
				} else {
					me.css({'fill':'#F0F0F0', 'fill-opacity': 1});
				}

				me.popover({
					trigger: "hover",
					title: county.county + '<span class="metainfo"> ' + county.category + ' at large</span>',
					html: true,
					content: "<p>Share black voters: " + county.blkvoters + "%</p><p>Share black officials: " + county.blkofficials + "%</p><p>" + overUnder(county.representation) + "%</p>",
					container: $("#tip")
				}).hover(function () {
					this.classList.add("hover");
					//SVG does not support Z-index, so in order to get this element on top it needs to be moved up in the DOM
					var tmp = $(this).detach();
					$("svg").append(tmp);
				}, function(){
					this.classList.remove("hover"); //broken in IE lte 10
				});
			}); //json.forEach

			function overUnder(rep){
				if(rep > 0){
					return "Blacks <span style='color:" + blk + "'><strong>over-represented</strong></span> by: " + rep;
				} else {
					return "Blacks <span style='color:" + wht + "'><strong>under-represented</strong></span> by: " + Math.abs(rep);
				}
			}

			$(".btn").on("click", function(e){
				var btn = $(e.target);
				if(btn.hasClass("btn-primary")){ //button was already selected, restore defaults
					btn.removeClass("btn-primary");
					btn.find(".glyphicon").remove();
					$(".county").each(function(){
						if(this.classList.contains("selected")){
							this.classList.remove("selected");
						} else {
							this.classList.remove("muted");
							$(this).css({ 'fill-opacity': this.op });
						}
					});
				} else {
					btn.addClass("btn-primary");
					btn.append("<span class='glyphicon glyphicon-remove'></span>");
					$(".county").each(function(){
						if(!this.op){
							this.op = $(this).css('fill-opacity'); //so we can reset it later
						}
						if(this.classList.contains(e.target.id)){
							if(this.classList.contains("muted")){
								this.classList.remove("muted");
							}
							this.classList.add("selected");
							$(this).css({ 'fill-opacity': this.op });
							var tmp = $(this).detach();
							$("svg").append(tmp);
						} else {
							if(this.classList.contains("selected")){
								this.classList.remove("selected");
							}
							this.classList.add("muted");
							$(this).css({ 'fill-opacity': (this.op * .25) });
						}
					});
				}

				$(".btn").each(function(){ //deselect other buttons
					if(this.id != e.target.id && $(this).hasClass("btn-primary")){
						$(this).removeClass("btn-primary");
						$(this).find(".glyphicon").remove();
					}
				});
			});//btn.on
		}//setUp
	});//$map.load
}());