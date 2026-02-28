// @GENERATOR:play-routes-compiler
// @SOURCE:conf/routes

import play.api.mvc.Call


import _root_.controllers.Assets.Asset

// @LINE:1
package controllers {

  // @LINE:1
  class ReverseEmployeeController(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:3
    def createForm: Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "employees/new")
    }
  
    // @LINE:7
    def delete(id:Long): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "employees/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Long]].unbind("id", id)) + "/delete")
    }
  
    // @LINE:4
    def create: Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "employees")
    }
  
    // @LINE:5
    def editForm(id:Long): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "employees/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Long]].unbind("id", id)) + "/edit")
    }
  
    // @LINE:6
    def update(id:Long): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "employees/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Long]].unbind("id", id)))
    }
  
    // @LINE:1
    def list: Call = {
    
      () match {
      
        // @LINE:1
        case ()  =>
          
          Call("GET", _prefix)
      
      }
    
    }
  
  }


}
