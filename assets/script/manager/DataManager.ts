

let savepars = [];
function save(target: any, propertyKey: string) {
    savepars.push(propertyKey);
}



export default class DataManager {


    public getUploadData(): object {
        var data = {}
        for (var i = 0; i < savepars.length; ++i) {
            data[savepars[i]] = this[savepars[i]];
        }
        return data;
    }
}

