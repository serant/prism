function ImageStats() {
  this.pixelCount = 0;
  this.pixels = [];
  this.rgb = [];
  this.mean = 0;
  this.stdDev = 0;
}

ImageStats.prototype = {
  addPixel: function(r, g, b) {
    if (!this.rgb.length) {
      this.rgb[0] = r;
      this.rgb[1] = g;
      this.rgb[2] = b;
    } else {
      this.rgb[0] += r;
      this.rgb[1] += g;
      this.rgb[2] += b;
    }
    this.pixelCount++;
    this.pixels.push([r, g, b]);
  },

  getStdDev: function() {
    let mean = [
      this.rgb[0] / this.pixelCount,
      this.rgb[1] / this.pixelCount,
      this.rgb[2] / this.pixelCount
    ];
    let diff = [0, 0, 0];
    this.pixels.forEach(function(p) {
      diff[0] += Math.pow(mean[0] - p[0], 2);
      diff[1] += Math.pow(mean[1] - p[1], 2);
      diff[2] += Math.pow(mean[2] - p[2], 2);
    });
    diff[0] = Math.sqrt(diff[0] / this.pixelCount);
    diff[1] = Math.sqrt(diff[1] / this.pixelCount);
    diff[2] = Math.sqrt(diff[2] / this.pixelCount);

    return diff[0] + diff[1] + diff[2];
  }
};
export default ImageStats;
