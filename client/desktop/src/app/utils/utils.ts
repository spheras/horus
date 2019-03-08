export const isNil = (value: any): value is (null | undefined) => {
    return value === null || typeof (value) === 'undefined';
};

export const isObject = (value: any): boolean => {
    return value && value.constructor === Object;
};

export const isBlank = (value: any): boolean => {
    return isNil(value) ||
        (isObject(value) && Object.keys(value).length === 0) ||
        value.toString().trim() === '';
};

export const isPresent = (value: any): boolean => {
    return !isBlank(value);
};

export const reverseMultipolygon = (coordinates) => {
    for (let ipol = 0; ipol < coordinates.length; ipol++) {
        let polygon = coordinates[ipol];
        for (let iring = 0; iring < polygon.length; iring++) {
            let ring = polygon[iring];
            for (let ipoint = 0; ipoint < ring.length; ipoint++) {
                let point = ring[ipoint];
                let lat = point[1];
                let long = point[0];
                point[0] = lat;
                point[1] = long;
            }
        }
    }
};