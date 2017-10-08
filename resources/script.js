// Input your config
var config={
  host:"playground.qlik.com",
  prefix:"/playground/",
  port:"443",
  isSecure:true,
  rejectUnauthorized:false,
  apiKey:"CHANGE-ME",
  appname:"ca884155-3eff-4e30-a2a6-7d6c3a65d8cc"
};

var app

function authenticate() {
  Playground.authenticate(config)
}


function main() {
  require.config({
    baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
  })

  /**
   * Load the entry point for the Capabilities API family
   * See full documention: http://help.qlik.com/en-US/sense-developer/Subsystems/APIs/Content/MashupAPI/qlik-interface-interface.htm
   */

  require(['js/qlik'], function (qlik) {
    // We're now connected

    // Suppress Qlik error dialogs and handle errors how you like.
    qlik.setOnError(function (error) {
      console.log("qlik error", error)
    })

    // Open a dataset on the server.
    console.log("Connecting to appname: " + config.appname)
    app = qlik.openApp(config.appname, config)
    console.log(app)

    setupChart()
  })
}

function setupChart() {
  var hyperCubeDef = {
    qDimensions: [
      { qDef: { qFieldDefs: ["Ocean Basins"] } },
      { qDef: { qFieldDefs: ["GeoKey"] } },
    ],
    qMeasures: [
      { qDef: { qDef: "=Count(Title)" } }
    ],
    qInitialDataFetch: [{
      qTop: 0,
      qLeft: 0,
      qHeight: 3333,
      qWidth: 3
    }]
  }

  app.createCube(hyperCubeDef, function (hypercube) {
    console.log("Hypercube", hypercube.qHyperCube)

    const dataMatrix = hypercube.qHyperCube.qDataPages[0].qMatrix;
    const maxCommitment = hypercube.qHyperCube.qMeasureInfo[0].qMax;

    const bubbles = dataMatrix.map((m) => {
      const oceanName = m[0].qText;
      if (oceanName === "-" || oceanName === "Global") {
        return
      }
      const [long, lat] = JSON.parse(m[1].qText);
      return {
        name: oceanName,
        radius: m[2].qNum / maxCommitment * 75,
        fillKey: "OCEAN",
        latitude: lat,
        longitude: long,
      };
    }).filter(b => b);

    window.map.bubbles(bubbles);
  })
}
