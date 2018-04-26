$(document).ready(function($) {
  var Mll = '';
  var Mlg = '';
  var lastDv = '';

  var loading = $('<img>',{src:'public/image/loading.gif',class:'loading'})
  var r = 0;
  var loc = $('.location');
  var input = $('<input>',{id:"range", type:"range", min:"50", max:"1000", value:"0", step:"50"})
  var showRange = $('<div></div>',{id:'pickedRange',text: '50 Km'});
  var title = $('<p></p>',{text:'Select the max searching area', class:'title'}); 
  var btn = $('<button></button>',{text:'Confirm', class:'button', id:'confRange'}); 
  var holder = $('#list');

  $('#myLocation').click(function(event) {  
      loc.empty();
      loc.append(title).append(input).append(showRange).append(btn);
      loc.on('click focus blur keydown keyup keypress','#range',function(){
        result = $('#pickedRange');
        result.empty();
        result.append(input.val() + ' Km');
      });
      $('.location').on('click', '#confRange', function() {
        r = input.val();
        $('body').append(loading);
        getLocation();
      });
  });
  $('#deniedLocation').click(function() {
    $('#msg').text('Please allow as to use your location for best expirianc using the app')
    $('#msg').addClass(' alert-warning');
  });

  function getLocation(){
     if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition);
          $('.location').remove();
      } else if (error.code == error.PERMISSION_DENIED){
        console.log("you denied me :-(");
      } else { 
         console.log("Geolocation is not supported by this browser.");
      }    
  }

  function showPosition(position) {
    holder.empty();
      Mll = position.coords.latitude;
      Mlg = position.coords.longitude;
        $.ajax({
          url: 'http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat='+Mll+'&lng='+Mlg+'&fDstL=0&fDstU=' + r,
          type: 'GET'
        }).done(function(resp) {
          getData(resp);
        });
  }//end function showPosition

  function getData(resp) {
    console.log(resp);
      if (resp.acList.length > 0) {
        var list = new Array();
        for(i = 0;i < resp.acList.length;i++){
        list.push(resp.acList[i]);
        }
        function compare(a,b) {
          if (a.Alt < b.Alt)
            return 1;
          if (a.Alt > b.Alt)
            return -1;
          return 0;
        }
        lastDv = resp.lastDv;
        list.sort(compare);
        showData(list); 
      } else {
          holder.empty();
          holder.append('<h2>Sory, no aircraft in you\'r area. Select biger max range to search</h2>');

  holder.append(loc.append(title).append(input).append(showRange).append(btn));
  loc.on('click focus blur keydown keyup keypress','#range',function(){
    result = $('#pickedRange');
    result.empty();
    result.append(input.val() + ' Km');
  });

          holder.append()
          loading.remove();
          return false;
      }
    }//end function getData

    function update(){
       $.ajax({
          url: 'http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat='+Mll+'&lng='+Mlg+'&fDstL=0&fDstU=' + r + '&lastDv='+lastDv,
          type: 'GET'
        }).done(function(resp) {
          getData(resp);
        });
    }
   


  function showData(list){    
    holder.empty();    
    iconCol = $('<div></div>',{class:'col-4 text-center',text:'Direction'});
    feet = $('<div></div>',{class:'col-4 text-center',text:'Altitude in feet'});
    code = $('<div></div>',{class:'col-4 text-center',text:'Aircraft code'});
    holder.append($('<div></div>',{class:'row heder'}).append(iconCol).append(feet).append(code));

    for (i = 0; i < list.length; i++) {
      var row = $('<div></div>',{class:'row aircraft-row','data-craftId':list[i].Reg});
      //icon
      var iconWrapper = $('<div></div>',{class:'col-4 text-center'});
      var iconDir = getDirection(list[i].Brng);   
      var dir = $('<span></span>',{class:'dirTxt',text:iconDir});
      var icon = $('<i></i>',{class:'fas fa-plane '+iconDir});
      //altitude
      var altWrapper = $('<div></div>',{class:'col-4'})  
      var altitude = $('<p></p>',{class:'alti text-center',text:list[i].Alt + ' feet'});
      var sortAlt = list[i].Alt;
      //flight code number
      var codeNumWrapper = $('<div></div>',{class:'col-4'});
      var codeNum = $('<p></p>',{class:'alti text-center',text:list[i].CNum}); 

      holder.append(row.append(iconWrapper.append(icon).append(dir)));
      holder.append(row.append(altWrapper.append(altitude)));
      holder.append(row.append(codeNumWrapper.append(codeNum)));
    }//end for loop
    $('.loading').remove();
     setInterval(function(){ update() }, 60000);
  }

  function getDirection(iconDirection){
    if (iconDirection <= 90) {
        iconClass = 'North';
    } else if (iconDirection > 90 && iconDirection <= 180) {
        iconClass = 'East';
    } else if (iconDirection > 180 && iconDirection <= 270) {
      iconClass = 'South';
    } else {
      iconClass = 'West';
    }
    return iconClass;
  }


  $('body').on('click', '.aircraft-row', function() {
    $('#list').css({
      height: '100vh',
      overflow:' hidden',
      visibility: 'hidden'
    });
    holder = $('.about-aircraft');
    holder.empty();
    holder.append(loading);
    exit = $('<span></span>',{text:'X', class:'exit', id:'exit'});
    holder.append(exit);
    var craftId = $(this).data('craftid');
    //console.log(craftId);
      $.ajax({
        url: 'http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat='+Mll+'&lng='+Mlg+'&fRegQ=' + craftId,
        type: 'GET'
        }).done(function(r) {
          console.log(r);
          loading.remove();
          modelBox = $('<div></div>',{class:'col-sm-4 col-md-3 text-center title', text: 'Model:'});
          model = $('<div></div>',{class:'col-sm-8 col-md-5 content', text: r.acList[0].Mdl});

          goToBox = $('<div></div>',{class:'col-sm-4 col-md-3 text-center title', text: 'Destination'});
          goTo = $('<div></div>',{class:'col-sm-8 col-md-5 content', text: r.acList[0].To});

          comp = r.acList[0].Op;
          logo = comp.replace(/\s/g, '').toLowerCase();
          compIcon = $('<img>',{src:'//logo.clearbit.com/'+logo+'.com', class:'img-fluid compLogo'});

          logoBox = $('<div></div>',{class:'col-sm-8 col-md-5 content'});
          companyLogoSpace = $('<div></div>',{class:'col-sm-4 col-md-3 text-center title', text:'Company Logo'});

          
          holder.append($('<div></div>',{class:'row  justify-content-center wrapper'}).append(modelBox).append(model));
          holder.append($('<div></div>',{class:'row  justify-content-center wrapper'}).append(goToBox).append(goTo));
          holder.append($('<div></div>',{class:'row  justify-content-center wrapper'}).append(companyLogoSpace).append(logoBox.append(compIcon)));
          console.log(r);
        });
      $('.about-aircraft').fadeIn(300);
  });

  $('#about').on('click', '#exit', function() {
    $('#list').css({
      height: '100%',
      overflow:'visible',
      visibility : 'visible'
    });
    $('.about-aircraft').fadeOut('300'); 
  });

});