const folderName = "zebra.it-sol.it/"
export let options = {
	deps: ["elements", "ebapi-modules"],
	path: ""
} 
const GET_PATH = ()=>path+folderName


 const init = ()=>{
    d = deps.shift()
	const po = document.createElement('script');
	po.type = 'text/javascript';
	po.async = false;
    po.defer = false
	po.src = GET_PATH()+'zebralib/'+d+'.js';
	const s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(po, s);	
}

if(deps.at(0) != null)
init()


