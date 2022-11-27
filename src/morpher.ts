import { BufferGeometry, Points } from "three";

export class MeshMorpher{
	public geometries!:any
    public mesh!: Points;
    vertexOffset: any;

    constructor(mesh:Points){
        this.geometries = [];
        this.mesh = mesh;
        this.vertexOffset = [];
    
    }

	
    updateGeometry(percent:number){
		if(!this.mesh){
			return;
		}

		var firstMesh = Math.floor(percent);
		var secondMesh = Math.ceil(percent);
		if(!this.geometries[firstMesh] || !this.geometries[secondMesh]){
			return;
		}

		while(percent > 1){
			percent -= 1;
		}

		var vertexCount = this.mesh.geometry.attributes.poisition.array.length;
	

		for(var i = 0; i < vertexCount; i++){
	
			var tempPerc = percent + this.roundStep(percent) * this.vertexOffset[i];
			tempPerc = this.smooth(tempPerc);
			// this.mesh.geometry.vertices[i].copy(vectorMath.lerpVectors(pos1, pos2, tempPerc));
		}
		// this.mesh.geometry.verticesNeedUpdate = true;
		// this.mesh.geometry.computeVertexNormals();
		// this.mesh.geometry.computeFaceNormals();
	}

	addGeometry(geometry:BufferGeometry, pos:any){
		if(pos){
			this.geometries[pos] = geometry.clone();
		}
		else{
			this.geometries.push(geometry.clone());
		}
	}

	// this.addFiles = function(urls){
	// 	urls.forEach(function(url, pos){
	// 		objLoader.load(url, function(mesh){
	// 			var mesh = mesh.children[0];
				
	// 			var geometry = new THREE.Geometry().fromBufferGeometry( mesh.geometry );
	// 			mesh.geometry = geometry;
		
	// 			if(pos == 0){
	// 				self.mesh = mesh;

	// 				mesh.material = new THREE.MeshPhongMaterial({color: 0x00ada7});
	// 				mesh.material.shading = THREE.FlatShading;

	// 				for(var i = 0; i < mesh.geometry.vertices.length; i++){
	// 					var seed = mesh.geometry.vertices[i].x + mesh.geometry.vertices[i].y;
	// 					self.vertexOffset[i] = self.random(seed)*0.1-0.05;

	// 				}

	// 				scene.add(self.mesh);
	// 			}

	// 			mesh.geometry.name = url;

	// 			self.addGeometry(mesh.geometry, pos);
	// 		});
	// 	});
	// }

	smooth(x:number){
		return -6*Math.pow(x, 3) + 9*Math.pow(x, 2) - 2*x;
	}

	roundStep(x:number){
		return 1-Math.pow(1-2*x, 2);
	}

	random(seed:number){
		return (1103515245 * seed + 12345) % 65536 / 65536;
	}
}



