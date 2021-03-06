/*

HOW TO USE:

  METHODS:

      initSwipe    -> OBLIGATORY TO INITILIZE THE PANEL
      cancelSwipe  -> STOP ALL THE PANEL BEHAVIOR 
      openPanel    -> OPEN THE PANEL
      closePanel   -> CLOSE THE PANEL
      switchPanel  -> SWITCH THE POSITION OF THE PANEL

  OPTION:

      element      : 'ID',        -> STRING, id - ELEMENT PANEL 
      elementTop   : 'ID',        -> STRING, id - DISTANCE FROM TOP
      elementTop   : 20,          -> NUMBER     - DISTANCE FROM TOP
      elementWidth : 20,          -> NUMBER     - PANEL'S WIDTH
      elementDistance : 50,       -> NUMBER     - MINIMUN SWIPE DISTANCE TO START SWIPING (IF THIS IS ON 'elementPoint' OPTION IS FALSE )
      elementPoint    : true / false -> BOOLEAN - MINIMUN AREA TO START SWIPING (IF YOU USE THIS OPTION, YOU CAN'T USE 'elementDistance' OPTION )
      elementDisabled : true / false -> BOOLEAN - CLOSE PANEL ON CLICK OUTSIDE ITSELF. USE THE CLASS 'panelDisabled' TO CREATE EXCEPTIONS
      onOpen          : string -> function to execute on panel start opening
      onOpenFinish    : string -> function to execute on panel finish opening
      onClose         : string -> function to execute on panel start closing
      onCloseFinish   : string -> function to execute on panel finish closing
      onTouch         : string -> function to execute on panel finish opening
      onTouchFinish   : string -> function to execute on panel finish closing

*/

  var swipe_panel = function(settings){
    "use strict";
    var self = this;
    var defaults;
    settings ? defaults = settings : defaults = {};

    // PANEL VARIABLES
    self.panel = defaults.element ? document.getElementById(defaults.element) : document.getElementById('panel');   // PANEL ELEMENT
    self.placement = defaults.placement ? defaults.placement : left; // OPTION TO INCLUDE A RIGHT PANEL IN THE FUTURE 

    // IF 'elementDistance' IS NOT SET IN DEFAULTS OPTIONS THEN IF MIN POINT IS SET IN DEFAULTS OPTIONS 'MinPoint' IS TRUE
    var MinPoint         = defaults.elementDistance ? false : defaults.elementPoint ? true : false;
    // IF 'MinPoint' IS TRUE, THIS IS THE WIDTH OF TOUCHABLE AREA TO OPEN THE PANEL
    var swipeMinPoint    = MinPoint ? WScreen/5  : false;   
    // OPTION TO SET UP A TOP. CAN BE A NUMBER OR AN ELEMENT (IN CASE YOU USE AN ELEMENT TO HAVE TO SPECIFY ITS 'ID')
    var elementTop = defaults.elementTop ? !isNaN(defaults.elementTop) ? defaults.elementTop : (document.getElementById(defaults.elementTop).offsetTop +              document.getElementById(defaults.elementTop).offsetHeight) : 0;
    // OPTION TO SET UP A WIDTH
    var elementWidth = defaults.elementWidth ? defaults.elementWidth : 75;

    // SWIPE VARIABLES
    var WScreen = screen.width; // SCREEN WIDTH
    var swipeStartX;            // TOUCH START POINT
    var initTime = 0;           // TOUCH START TIME
    var left;                   // PANEL POSITION ON SWIPE START
    var movement;               // PIXELS MOVED FROM TOUCH START TO TOUCH END
    var position;               // PANEL OFFSET LEFT ON SWIPE FINISH
    var moveX;                  // TOUCH POSITION DURING SWIPE AND TOUCH POSITION ON SWIPE FINISH
    var moved = false;          // AUXILIAR VARIABLE TO APPLY TRANSITIONS OR NOT AFTER SWIPE
    var forze = false;          // AUXILIAR VARIABLE TO FORZE SWIPE TO APPEND
    var allow_swipe = true;     // AUXILIAR VARIABLE TO AVOID PANEL MOVEMENT ON CLICK OUTSIDE IT
    var swipeMaxDistance = (WScreen * elementWidth) / 100 ;   // MAX SWIPE DISTANCE
    console.log(swipeMaxDistance)
    var swipeMinDistance = defaults.elementDistance || 20;    // MIN SWIPE DISTANCE IN PIXELS
    var touchcallback = defaults.onTouch ? defaults.onTouch : false;      // NECESARY TO EXECUTE CALLBACKS ON TOUCH START
    

    /*
    MEASURE JAVASCRIPT MEMORY USAGE
    setInterval(function(){
      console.log(window.performance.memory);
    },1000);
    */
    // CSS STYLE AND ANIMATION FOR PANEL TRANSITIONS
    var addStyle = function(){
      var style = document.createElement('style');
      style.type = 'text/css';
      
      style.innerHTML = '.panel_position{  ' +
                            'top: '+ elementTop + 'px; ' +
                            'width: '+ elementWidth + '%; ' +
                        '}';
      document.getElementsByTagName('head')[0].appendChild(style);
    }
    
    // TOUCH EVENTS INITIALIZE
    self.initSwipe = function(){
      addStyle();
      document.addEventListener("touchstart", swipeStartHandler, false ); // EVENT FIRED ON TOUCH START
      document.addEventListener("touchmove" , swipeMoveHandler , false ); // EVENT FIRED DURING TOUCH
      document.addEventListener("touchend"  , swipeEndHandler  , true  ); // EVENT FIRED ON TOUCH FINISH
      document.addEventListener("mousedown", swipeStartHandler, false ); // EVENT FIRED ON MOUSE CLICK START
      document.addEventListener("mouseup"  , swipeEndHandler  , true  ); // EVENT FIRED ON MOUSE CLICK START
      //document.addEventListener("touchenter", endHandler, true);
      //document.addEventListener("touchleave", endHandler, true);
      //document.addEventListener("touchcancel", cancelHandler, true);   
    }
    
    // TOUCH EVENTS CANCEL
    self.cancelSwipe = function(){
      document.removeEventListener("touchstart", swipeStartHandler, false); // STOP EVENT FIRED ON TOUCH START
      document.removeEventListener("touchmove", swipeMoveHandler, false);   // STOP EVENT FIRED DURING TOUCH
      document.removeEventListener("touchend", swipeEndHandler, true);      // STOP EVENT FIRED ON TOUCH FINISH
      //document.removeEventListener("touchenter", endHandler, true);
      //document.removeEventListener("touchleave", endHandler, true);
      //document.removeEventListener("touchcancel", cancelHandler, true);   
    }

    // FUNCTION TO OPEN PANEL
    self.openPanel = function(forze){
      var Panel = self.panel;
      if(!Panel.classList.contains('open') || forze){
        Panel.classList.add("animate");
        Panel.style.WebkitTransform = "translate(0,0)";
        Panel.style.MozTransform    = "translate(0,0)";
        Panel.style.transform       = "translate(0,0)";  
        Panel.addEventListener( 'transitionend', remove_open_transition );  
        Panel.addEventListener( 'webkitTransitionEnd', remove_open_transition );
        defaults.onOpen ? window[defaults.onOpen]() : false;
        Panel.classList.add("open"); 
      }
    }
    var remove_open_transition = function(){
      defaults.onOpenFinish ? window[defaults.onOpenFinish]() : false; 
      var Panel = self.panel;  
      Panel.classList.remove("animate"); 
      Panel.removeEventListener("webkitTransitionEnd", remove_open_transition );
      Panel.removeEventListener("transitionend", remove_open_transition );
      forze = false;
    }

    // FUNCTION TO CLOSE PANEL
    self.closePanel = function(forze){
      var Panel = self.panel;
      if (Panel.classList.contains('open') || forze){
        Panel.classList.add("animate");
        Panel.style.WebkitTransform = "translate(-100%,0)";
        Panel.style.MozTransform    = "translate(-100%,0)";
        Panel.style.transform       = "translate(-100%,0)"; 
        Panel.classList.remove("open");  
        Panel.addEventListener( 'transitionend', remove_close_transition )  
        Panel.addEventListener( 'webkitTransitionEnd', remove_close_transition ); 
        defaults.onClose ? window[defaults.onClose]() : false ;
       }
    }
    var remove_close_transition = function(){
      defaults.onCloseFinish ? window[defaults.onCloseFinish]() : false;
      var Panel = self.panel;     
      Panel.classList.remove("animate"); 
      Panel.removeEventListener( 'transitionend', remove_close_transition )  
      Panel.removeEventListener( 'webkitTransitionEnd', remove_close_transition ); 
      forze = false;
    }

    // FUNTION TO KEEP PANEL AS IT WAS
    self.resetPanel = function(){
      forze = true;
      self.panel.classList.contains('open') ? self.openPanel(forze) : self.closePanel(forze);
    }
    
    // FUNCTION TO CHANGE THE ESTATE OF THE PANEL
    self.switchPanel = function(){
      self.panel.classList.contains('open') ? self.closePanel() : self.openPanel();
    }
    
    //  FUNTION ON TOUCH START
    var swipeStartHandler = function(startEvent){
      allow_swipe = true;
      if (self.panel.classList.contains('open') && defaults.elementDisabled && 
          startEvent.target.id != self.panel.id && !startEvent.target.classList.contains('panelDisabled')){
        startEvent.preventDefault();
        self.closePanel();
        allow_swipe = false;
      }

      startEvent.changedTouches ? 
        swipeStartX = startEvent.changedTouches[0].clientX :
        ( 
          swipeStartX = startEvent.x ,  
          document.addEventListener("mousemove", swipeMoveHandler, false ) // EVENT FIRED ON MOUSE CLICK START
        ) 
      
      left            = self.panel.getBoundingClientRect().left;
      initTime        = startEvent.timeStamp;
      touchcallback = defaults.onTouch ? defaults.onTouch : false;
    }  
 

    /*/////////////////////////////////////////////////
     FUNTIONS ON DRAG DEPENDING OF DEFAULTS OPTIONS 

    /*                                                //
      OPTION IF MIN TOUCH START POINT OPTION IS DESIRED
    //                                                */

    if (MinPoint){
      var swipeMoveHandler = function(moveEvent){
        if (allow_swipe){
          moveEvent.changedTouches ? moveX = moveEvent.changedTouches[0].clientX : moveX = moveEvent.x
          movement      = moveX - swipeStartX;
          position      = left + movement;   

          if ( (((swipeStartX < swipeMinPoint) && (left < -10)) || ((movement < -swipeMinDistance) && (left > -10))) && (movement < swipeMaxDistance) ){
            self.panel.style.WebkitTransform = "translate(" + position + "px ,0)";
            self.panel.style.MozTransform    = "translate(" + position + "px ,0)";
            self.panel.style.transform       = "translate(" + position + "px ,0)";
            moved = true;                   
            if(touchcallback) {
              window[defaults.onTouch]()
              touchcallback = false;
            }
          }
        }
      }
    }

    /*                                        //

      OPTION IF MIN MOVEMENT OPTION IS DESIRED 

    //                                        */
    else{
      var swipeMoveHandler = function(moveEvent){
        if (allow_swipe){
          moveEvent.changedTouches ? moveX = moveEvent.changedTouches[0].clientX : moveX = moveEvent.x
          movement      = moveX - swipeStartX;
          position      = left + movement;   

          if ( (((movement > swipeMinDistance) && (left < -10)) || ((movement < -swipeMinDistance) && (left > -10))) && (movement < swipeMaxDistance) ){
            self.panel.style.WebkitTransform = "translate(" + position + "px ,0)";
            self.panel.style.MozTransform    = "translate(" + position + "px ,0)";
            self.panel.style.transform       = "translate(" + position + "px ,0)";
            moved = true;          
            if(touchcallback) {
              window[defaults.onTouch]()
              touchcallback = false;
            }
          }
        }
      }
    }

    /*                        //

      FUNTION ON TOUCH FINISH

    //                        */

    var swipeEndHandler = function(moveEvent){
      moveEvent.changedTouches ? false : document.removeEventListener("mousemove", swipeMoveHandler, false ); // EVENT FIRED ON CLICK FINISH
      var time = ( moveEvent.timeStamp - initTime) /1000;  // TIME FROM TOUCH START TO TOUCH END
      forze = true;
      if (time < .5 && moved === true){ 
        (movement > WScreen/7) ? self.openPanel() : self.closePanel(forze)
        defaults.onTouchFinish ? window[defaults.onTouchFinish]() : false ;
      }
      else{
        if (moved === true){
          (movement > WScreen/3) ? self.openPanel() : self.resetPanel(forze)
          defaults.onTouchFinish ? window[defaults.onTouchFinish]() : false ;
        }
      }
      moved = false;
    }
  }