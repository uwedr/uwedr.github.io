const DEFAULT_SERVER    = 'https://f1dappl0.test.sozvers.at:44320';
//const DEFAULT_SERVER    = 'https://gesundheitskasse-q.eu20.analytics.cloud.sap/lcs/scc/tunnel/F1DTEST';
const DEFAULT_SERVICE   = 'sap/opu/odata4/sap/zapi_bc_sac_bp_request_o4/srvd_a2x/sap/zbc_sac_bp_request/0001'; 
const DEFAULT_ENTITYSET = 'BPRequest';
const DEFAULT_SAPCLIENT = '612';
const ACCESS_CONTROL_ALLOW_ORIGIN = 'https://gesundheitskasse-q.eu20.analytics.cloud.sap/';


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
    constructor (elementId) {
      super();

      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
	  
	  this._server    = DEFAULT_SERVER;
	  this._service   = DEFAULT_SERVICE;
	  this._entitySet = DEFAULT_ENTITYSET;
	  this._sapClient = DEFAULT_SAPCLIENT;
	  this._csrfToken = ''
    }
	
	setServer (server) {
      this._server = server;
	}
	
	getServer () {
	  return this._server;
	}
	
	setService (service) {
      this._service = service;
	}
	
	getService () {
      return this._service;
	}
	
	setEntitySet (entitySet) {
      this._entitySet = entitySet;
	}
	
	getEntitySet () {
    	return this._entitySet;
	}

	setSAPClient (sapClient) {
		this._sapClient = sapClient;
	}
	  
	getSAPClient () {
		return this._sapClient;
	}
	
	async fetchCSRFToken () {
		const url = `${this._server}/${this._service}/?sap-client=${this._sapClient}`;
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'X-CSRF-Token'                    : 'Fetch',
					'Access-Control-Allow-Methods'    : 'GET',
					'Access-Control-Allow-Origin'     : ACCESS_CONTROL_ALLOW_ORIGIN,
					'Access-Control-Allow-Credentials': true,
					'Access-Control-Expose-Headers'   : 'X-Csrf-Token,x-csrf-token',
					'X-Requested-With'                : 'XMLHttpRequest'
				},
				credentials: 'include'
			});
			if (response.ok) {
				this._csrfToken = response.headers.get("x-csrf-token");
			} else {
				throw new Error(`Fehler beim Abruf des CSRF Token.\nHTTP Status Code: ${response.status}`);
			}
		} catch (error) {
			console.log(error);
			throw(error);        // Re-throw the error to be caught by the caller
		}
	  }
	
	
	async createProjectWithWBS (request, items) {
		const result = new Object();

		// prepare data -> convert strings into numerical values
		for (var i=0; i<items.length; i++) {
			var item = items[i];
			
			if (item.hasOwnProperty('zzgkosten')) {
				item.zzgkosten = Number(item.zzgkosten);				
			};
			if (item.hasOwnProperty('zzkostservice')) {
				item.zzkostservice = Number(item.zzkostservice);
			};
			if (item.hasOwnProperty('zzkmiete')) {
				item.zzkmiete = Number(item.zzkmiete);
			};
			if (item.hasOwnProperty('zzkverbrauch')) {
				item.zzkverbrauch  = Number(item.zzkverbrauch);
			};
		};
		request._bp_item = items;
		// check CSRF-Token
		if (this._csrfToken === '') {
			try {
				await this.fetchCSRFToken();
			} catch(error) {
				console.log('Fehler in Methode createProjectWithWBS.');
				console.log(error.stack);
				result.type = 'P2RCreateProjectResultException';
				result.messages = [ error.stack ];
				return result;
			}
		}
		
		// send POST request
		try {
			debugger;
			var test = JSON.stringify(request);

			const url = `${this._server}/${this._service}/${this._entitySet}?sap-client=${this._sapClient}`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-type'                     : 'application/json',
					'Cache-Control'                    : 'no-cache',
					'Access-Control-Allow-Credentials' : true,
					'Access-Control-Allow-Methods'     : 'POST',
					'Access-Control-Allow-Origin'      : ACCESS_CONTROL_ALLOW_ORIGIN,
					"X-Referrer-Hash"                  : window.location.hash,
					'X-CSRF-Token'                     : this._csrfToken
				},
				credentials: 'include',
				body: JSON.stringify(request)
			});
			result.status = response.status;
			result.url = response.url;

			if (response.ok) {
				let project = await response.json();
				if (project.hasOwnProperty('_bp_item')) {
					project.items = project._bp_item;
					delete project._bp_item;				
				};
				result.type = 'P2RCreateProjectResultOk';
				result.project = project;
			} else {
				result.type = 'P2RCreateProjectResultError'
				switch (result.status) {
					case 400:     // Bad Request
						let res = await response.json();
						result.messages = (await res.error.message === "") ? [] : [res.error.message];
						if (res.error.hasOwnProperty('details')) {
							result.messages.concat(await res.error.details.map(x => x.message));				
						};
						break;
					case 401:     // Unauthorized
					    result.messages = ['Berechtigungsfehler bei der Projektanlage']
						break;
					default:
				}

				
			}
		} catch (error) {
			console.log('Fehler in Methode createProjectWithWBS.');
			console.log(error.stack);
			result.type = 'P2RCreateProjectResultException';
			result.messages = [ error.stack ];
			return result;
		}
		return result;
    }

	async exportDataToS4(jahr, version, typ, wert) {
		const result = new Object();
		let selection = ``;
		debugger;
		switch (typ) {
			case 'Antrag':
				selection = `JAHR='${jahr}',SAC_VERSION='${version}',SAC_ANTRAG='${wert}',S4_PROJEKT=''`; 
    		break;
  			case 'Projekt':
				selection = `JAHR='${jahr}',SAC_VERSION='${version}',SAC_ANTRAG='',S4_PROJEKT='${wert}'`; 
    			break;
  			default:
				// TODO: Fehlermeldung und Abbruch
				return result;
		}
		const url = `${this._server}/${this._service}/${this._entitySet}/SAP__self.importData(${selection})?sap-client=${this._sapClient}`;
		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'X-CSRF-Token'                    : 'Fetch',
					'Access-Control-Allow-Methods'    : 'GET',
					'Access-Control-Allow-Origin'     : ACCESS_CONTROL_ALLOW_ORIGIN,
					'Access-Control-Allow-Credentials': true,
					'Access-Control-Expose-Headers'   : 'X-Csrf-Token,x-csrf-token',
					'X-Requested-With'                : 'XMLHttpRequest'
				},
				credentials: 'include'
			});
			result.status = response.status;
			result.url = response.url;
            
			switch (result.status) {
				case 200:
					result.type = 'P2RInterfaceResultOk';
					let res = await response.json();
					result.messages = (await res.message === "") ? [] : [res.message];
					break;
				case 400:
					result.type = 'P2RInterfaceResultError';
					res = await response.json();
					result.messages = (await res.error.message === "") ? [] : [res.error.message];
					if (res.error.hasOwnProperty('details')) {
						result.messages.concat(await res.error.details.map(x => x.message));				
					};
					break;
				case 401:
					result.type = 'P2RInterfaceResultError';
					result.messages = ['Berechtigungsfehler bei Datenexport (Status 401)'];
					break;
				default:
					result.type = 'P2RInterfaceResultError';
					result.messages = [`Unbekannter Fehler bei Datenexport. Status ${result.status}`];
			}
		} catch (error) {
			console.log('Fehler in Methode exportDataToS4.');
			console.log(error.stack);
			result.type = 'P2RInterfaceResultException'
			result.messages = [ error.stack ];	
		}
		return result
    }
  }

  customElements.define('com-sap-sac-p2r-interface', Main);
})()
