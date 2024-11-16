const DEFAULT_SERVER    = 'https://f1dappl0.test.sozvers.at:44320';
const DEFAULT_SERVICE   = 'sap/opu/odata4/sap/zapi_bc_sac_bp_request_o4/srvd_a2x/sap/zbc_sac_bp_request/0001'; 
const DEFAULT_ENTITYSET = '';
const DEFAULT_SAPCLIENT = '612';


(function () {
  const template = document.createElement('template')
  template.innerHTML = `
        <style>
        </style>
        
        <div id="root" style="width: 100%; height: 100%;">
          <p><a id = "link_href" href="https://www.sap.com/" target="_blank" >Fetch request</a></p>
        </div>
      `

  class Main extends HTMLElement {
    constructor () {
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
	  
	  this._server    = DEFAULT_SERVER;
	  this._service   = DEFAULT_SERVICE;
	  this._entitySet = DEFAULT_ENTITYSET;
	  this._sapClient = DEFAULT_SAPCLIENT;
	  this._csrfToken = ''
    }
	
	setServer (server) {
      this._server = server
	}
	
	getServer () {
	  return this._server
	}
	
	setService (service) {
      this._service = service
	}
	
	getService () {
      return this._service
	}
	
	setEntitySet (entitySet) {
      this._entitySet = entitySet
	}
	
	setEntitySet (entitySet) {
    	return this._entitySet
	}
	
	async fetchCSRFToken () {
	  debugger;
		
		try {
			const response = await fetch('https://f1dappl0.test.sozvers.at:44320/sap/opu/odata4/sap/zapi_bc_sac_bp_request_o4/srvd_a2x/sap/zbc_sac_bp_request/0001/?sap-client=612', {
				method: 'GET',
				headers: {
					'X-CSRF-Token'                    : 'Fetch',
					'Access-Control-Allow-Methods'    : 'GET',
					'Access-Control-Allow-Origin'     : 'https://gesundheitskasse-q.eu20.analytics.cloud.sap/',
					'Access-Control-Allow-Credentials': true,
					'Access-Control-Expose-Headers'   : 'X-Csrf-Token,x-csrf-token',
					'X-Requested-With'                : 'XMLHttpRequest'
				},
				credentials: 'include'
			});
			if (response.ok) {
				this._csrfToken = response.headers.get("x-csrf-token");
			} else {
				throw new Error('Respnse status: ${response.status}');
			}
		} catch (error) {
			console.log(error);
			throw(error);        // Re-throw the error to be caught by the caller
		}
	  debugger;
	  }
	
	
	//createProjectWithWBS (request, items) {
	//	debugger;
		
		// prepare data
	//	for (var i=0; i<items.length; i++) {
	//		var item = items[i];
			
	//		if (item.hasOwnProperty('zzgkosten')) {
	//			item.zzgkosten = Number(item.zzgkosten);				
	//		};
	//		if (item.hasOwnProperty('zzkostservice')) {
	//			item.zzkostservice = Number(item.zzkostservice);
	//		};
	//		if (item.hasOwnProperty('zzkmiete')) {
	//			item.zzkmiete = Number(item.zzkmiete);
	//		};
	//		if (item.hasOwnProperty('zzkverbrauch')) {
	//			item.zzkverbrauch  = Number(item.zzkverbrauch);
	//		};
	//	};
	//	request._bp_item = items;

		// check CSRF-Token
	//	if (this._csrfToken === '') {
	//	  this._fetchCSRFToken()
	//	}
		
		// send POST request
	//	let xhr = new XMLHttpRequest();
	//	xhr.open('POST', url, false);
	//	xhr.setRequestHeader('Content-type', 'application/json');
	//	xhr.setRequestHeader('Access-Control-Allow-Credentials', true);
	//	xhr.setRequestHeader('Cache-Control', 'no-cache');
	//	xhr.setRequestHeader("X-Referrer-Hash", window.location.hash);
	//	xhr.setRequestHeader('Access-Control-Allow-Origin', 'https://gesundheitskasse-q.eu20.analytics.cloud.sap/');
	//	xhr.setRequestHeader('Access-Control-Allow-Methods', 'POST');
	//	xhr.setRequestHeader('X-CSRF-Token', this._csrfToken);
	//	xhr.withCredentials = true;
	//	xhr.send(JSON.stringify(data));
		
	//	xhr.onload = function() {
	//	switch(status) {
	//	  case 201:    // Created
	//	    self._csrfToken = xhr.getResponseHeader('x-csrf-token');
	//	    break;
	//	  case 401:    // 401 Unauthorized
	//	    break;
	 //     default:
		    // ????
	//	}
	//  }
		
		
	//	if (xhr.readyState == 4) {
	//		  if (xhr.status == 201) {
	//			 //Get Status
	//			this.Response = JSON.parse(xhr.responseText);
	//			//Get Status
	//			this.Status = xhr.status
	//		  } else {
	//			//Get Status
	//			this.Status = xhr.status
	//		  };
	//		};
	//	};
		

    //}




    render () {
     
    }
	
  }

  customElements.define('com-sap-sac-fetch', Main)
})()
