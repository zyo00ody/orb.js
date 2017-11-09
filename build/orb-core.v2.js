// orb.js
//
// Orb 2.1.0 - Javascript Library for Astronomical Calcrations
//
// Copyright (c) 2017 KASHIWAI, Isana
// Licensed under the MIT license (MIT-LICENSE.txt),

// for Name Space
var Orb;

Orb = Orb || {};

Orb.Storage = Orb.Storage ||  {}

// constant.js
Orb.Constant = Orb.Constant ||  {
  "PI":Math.PI,
  "RAD":Math.PI/180, //RADIAN
  "AU":149597870.700, //ASTRONOMICAL_UNIT(km)
  "RE": 6378.137, //EARTH_RADIUS(km)
  "LD": 384000, //LUNA_DISTANCE(km)
  "LY": Number("9.46073E+12"), //LIGHT_YEAR(km)
  "PC":Number("3.08568E+13"), //PARSEC(km)
  "G":Number("6.6740831E-11"), //GRAVITATIONAL_CONSTANT
  "GM":2.9591220828559093*Math.pow(10,-4),
  "Planets":["Sun","Mercury","Venus","Earth","Moon","Mars","Jupiter","Saturn","Uranus","Neptune"],
  "Sun":{
    "radius":1392038/2,
    "obliquity":7.25,
    "mass":Number("1.989E+30"),
    "gm":Number("1.327124400189E+11")
  },
  "Mercury":{
    "radius":4879.4/2,
    "obliquity":0.027,
    "mass":Number("3.301E+23"),
    "gm":220329
  },
  "Venus":{
    "radius":12103.6/2,
    "obliquity":177.36,
    "mass":Number("4.867E+24"),
    "gm":3248599
  },
  "Earth":{
    "radius":12756.3/2,
    "obliquity":23.435,
    "mass":Number("5.972E+24"),
    "gm": Number("3.9860044189E+5")
  },
  "Moon":{
    "radius":1737.4,
    "obliquity":1.5424,
    "mass":Number("7.346E+22"),
    "gm":4904.86959
  },
  "Mars":{
    "radius":6794.4/2,
    "obliquity":25,
    "mass":Number("6.417E+24"),
    "gm":42828.9
  },
  "Jupiter":{
    "radius":142984/2,
    "obliquity":3.08,
    "mass":Number("1.899E+27"),
    "gm":1266865349
  },
  "Saturn":{
    "radius":120536/2,
    "obliquity":26.7,
    "mass":Number("5.685E+26"),
    "gm":379311879
  },
  "Uranus":{
    "radius":51118/2,
    "obliquity":97.9,
    "mass":Number("8.682E+26"),
    "gm":57939399
  },
  "Neptune":{
    "radius":49572/2,
    "obliquity":29.6,
    "mass":Number("1.024E+26"),
    "gm":68365299
  }
}
Orb.Const = Orb.Constant

// core.js
Orb.RoundAngle = Orb.RoundAngle || function(degree){
  var angle = degree%360
  if(angle<0){
    angle = angle+360
  }
  return angle;
}

Orb.NutationAndObliquity  = Orb.NutationAndObliquity || function(date){
  var rad = Orb.Constant.RAD
  //var dt = DeltaT()/86400;
  //var dt = 64/86400;
  var time = new Orb.Time(date)
  var jd = time.jd();// + dt;
  var t = (jd -2451545.0)/36525;
  var omega = (125.04452 - 1934.136261*t+0.0020708*t*t + (t*t+t)/450000)*rad;
  var L0 = (280.4665 + 36000.7698*t)*rad
  var L1 = (218.3165 + 481267.8813*t)*rad
  return {
    nutation:function(){
      var nutation = (-17.20/3600)*Math.sin(omega)-(-1.32/3600)*Math.sin(2*L0)-(0.23/3600)*Math.sin(2*L1)+(0.21/3600)*Math.sin(2*omega)/rad;
      return nutation;
    },
    obliquity:function(){
      var obliquity_zero = 23+26.0/60+21.448/3600 -(46.8150/3600)*t -(0.00059/3600)*t*t +(0.001813/3600)*t*t*t;
      var obliquity_delta = (9.20/3600)*Math.cos(omega) + (0.57/3600)*Math.cos(2*L0) +(0.10/3600)*Math.cos(2*L1)-(0.09/3600)*Math.cos(2*omega);
      var obliquity= obliquity_zero + obliquity_delta;
      return obliquity;
    }
  }
}
Orb.Obliquity  = Orb.Obliquity || function(date){
 var ob = new Orb.NutationAndObliquity(date)
 return ob.obliquity()
}

//time.js
Orb.Time = Orb.Time || function(date){
  if(!date){
    var _date = new Date();
  }else{
    var _date = date;
  }

  var _getUTCArray = function(_date){
    return {
      year: _date.getUTCFullYear(),
      month: _date.getUTCMonth()+1,
      day: _date.getUTCDate(),
      hours: _date.getUTCHours(),
      minutes: _date.getUTCMinutes(),
      seconds: _date.getUTCSeconds()
    }
  }

  var _utc = _getUTCArray(_date);

  var _time_in_day = function(){
      return _utc.hours/24 + _utc.minutes/1440 + _utc.seconds/86400
  }

  var _jd = function(){
      var year = _utc.year;
      var month = _utc.month;;
      var day = _utc.day;
      var calender = "";
      if(month <= 2){
        var year = year - 1;
        var month = month + 12;
      }
      var julian_day = Math.floor(365.25*(year+4716))+Math.floor(30.6001*(month+1))+day-1524.5;
      if (calender == "julian"){
        var transition_offset=0;
      }else if(calender == "gregorian"){
        var tmp = Math.floor(year/100);
        var transition_offset=2-tmp+Math.floor(tmp/4);
      }else if(julian_day<2299160.5){
        var transition_offset=0;
      }else{
        var tmp = Math.floor(year/100);
        var transition_offset=2-tmp+Math.floor(tmp/4);
      }
      var jd=julian_day+transition_offset;
      return jd;
  }

  var _gmst = function(){
    var rad = Orb.Constant.RAD
      var time_in_sec = _utc.hours*3600 + _utc.minutes*60 + _utc.seconds;
      var jd = _jd();
      //gmst at 0:00
      var t = (jd-2451545.0)/36525;
      var gmst_at_zero = (24110.5484 + 8640184.812866*t+0.093104*t*t+0.0000062*t*t*t)/3600;
      if(gmst_at_zero>24){gmst_at_zero=gmst_at_zero%24;}
      //gmst at target time
      var gmst = gmst_at_zero+(time_in_sec * 1.00273790925)/3600;
      //mean obliquity of the ecliptic
      var e = 23+26.0/60+21.448/3600 -46.8150/3600*t -0.00059/3600*t*t +0.001813/3600*t*t*t;
      //nutation in longitude
      var omega = 125.04452-1934.136261*t+0.0020708*t*t+t*t*t/450000;
      var long1 = 280.4665 + 36000.7698*t;
      var long2 = 218.3165 + 481267.8813*t;
      var phai = -17.20*Math.sin(omega*rad)-(-1.32*Math.sin(2*long1*rad))-0.23*Math.sin(2*long2*rad) + 0.21*Math.sin(2*omega*rad);
      gmst =gmst + ((phai/15)*(Math.cos(e*rad)))/3600
      if(gmst<0){gmst=gmst%24+24;}
      if(gmst>24){gmst=gmst%24;}
      return gmst
  }

  var _delta_t = function(){
      //NASA - Polynomial Expressions for Delta T
      //http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
      var year = _utc.year;
      var month = _utc.month;;
      var y = year + (month - 0.5)/12

      if(year<=-500){
        var u = (y-1820)/100
        var dt = -20 + 32 * u*u;
      }else if(year>-500 && year<=500){
        var u = y/100;
        var dt = 10583.6 - 1014.41 * u + 33.78311 * u*u - 5.952053 * u*u*u - 0.1798452 * u*u*u*u + 0.022174192 * u*u*u*u*u + 0.0090316521 * u*u*u*u*u;
      }else if(year>500 && year<=1600){
        var u = (y-1000)/100
        var dt = 1574.2 - 556.01 * u + 71.23472 * u*u + 0.319781 * u*u*u - 0.8503463 * u*u*u*u - 0.005050998 * u*u*u*u*u + 0.0083572073 * u*u*u*u*u*u;
      }else if(year>1600 && year<=1700){
        var t = y - 1600
        var dt = 120 - 0.9808 * t - 0.01532 * t*t + t*t*t/7129
      }else if(year>1700 && year<=1800){
        var t = y - 1700
        var dt = 8.83 + 0.1603 * t - 0.0059285 * t*t + 0.00013336 * t*t*t - t*t*t*t/1174000
      }else if(year>1800 && year<=1860){
        var t = y - 1800
        var dt = 13.72 - 0.332447 * t + 0.0068612 * t*t + 0.0041116 * t*t*t - 0.00037436 * t*t*t*t + 0.0000121272 * t*t*t*t*t - 0.0000001699 * t*t*t*t*t*t + 0.000000000875 * t*t*t*t*t*t*t;
      }else if(year>1860 && year<=1900){
        var t = y - 1860
        var dt = 7.62 + 0.5737 * t - 0.251754 * t*t + 0.01680668 * t*t*t -0.0004473624 * t*t*t*t + t*t*t*t*t/233174
      }else if(year>1900 && year<=1920){
        var t = y - 1900
        var dt = -2.79 + 1.494119 * t - 0.0598939 * t*t + 0.0061966 * t*t*t - 0.000197 * t*t*t*t
      }else if(year>1920 && year<=1941){
        var t = y - 1920
        var dt = 21.20 + 0.84493*t - 0.076100 * t*t + 0.0020936 * t*t*t
      }else if(year>1941 && year<=1961){
        var t = y - 1950
        var dt = 29.07 + 0.407*t - t*t/233 + t*t*t/2547
      }else if(year>1961 && year<=1986){
        var t = y - 1975
        var dt = 45.45 + 1.067*t - t*t/260 - t*t*t/718
      }else if(year>1986 && year<=2005){
        var t = y - 2000
        var dt = 63.86 + 0.3345 * t - 0.060374 * t*t + 0.0017275 * t*t*t + 0.000651814 * t*t*t*t + 0.00002373599 * t*t*t*t*t
      }else if(year>2005 && year<=2050){
        var t = y - 2000
        var dt = 62.92 + 0.32217 * t + 0.005589 * t*t
      }else if(year>2050 && year<=2150){
        /*
        This expression is derived from estimated values of ��T in the years 2010 and 2050. The value for 2010 (66.9 seconds) is based on a linearly extrapolation from 2005 using 0.39 seconds/year (average from 1995 to 2005). The value for 2050 (93 seconds) is linearly extrapolated from 2010 using 0.66 seconds/year (average rate from 1901 to 2000).
        */
        var dt = -20 + 32 * ((y-1820)/100)*((y-1820)/100) - 0.5628 * (2150 - y)
        //The last term is introduced to eliminate the discontinuity at 2050.
      }else if(year>2150){
        var u = (y-1820)/100
        var dt = -20 + 32 * u*u
      }
    return dt;
    } // end of _delta_t()

    var _et = function(){
      var et = new Date();
      et.setTime(_date.getTime() + _delta_t());
      var time = new Orb.Time(et);
      return time;
    }

  var _doy = function(){
    var d=_date
    var d0=new Date(Date.UTC(d.getFullYear()-1,11,31,0,0,0));
    var doy=((d.getTime()-d.getTimezoneOffset()-d0.getTime())/(1000*60*60*24)).toFixed(8);
    return doy
  }

  return {
    date : _date,
    year: Number(_utc.year),
    month: Number(_utc.month),
    day: Number(_utc.day),
    hours: Number(_utc.hours),
    minutes: Number(_utc.minutes),
    seconds: Number(_utc.seconds),
    time_in_day:function(){
      return _time_in_day()
    },
    jd : function(){
      return _jd() + _time_in_day()
    },
    gmst: function(){
      return _gmst()
    },
    doy: function(){
      return _doy()
    }
  } // end of return Orb.Time
} // end of Orb.Time