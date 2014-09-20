var nodesvm = require('node-svm');

module.exports.svmTrain = function () {
    var xorProblem = [
        [
            [0, 0],
            0
        ],
        [
            [0, 1],
            1
        ],
        [
            [1, 0],
            1
        ],
        [
            [1, 1],
            0
        ]
    ];

    var svm = new nodesvm.CSVC({
        kernelType: nodesvm.KernelTypes.RBF,
        gamma: 0.5,
        C: 1,
        nFold: 1,
        normalize: false,
        reduce: false
    });

    svm.once('trained', function(report) {
        console.log('SVM trained. report :\n%s', JSON.stringify(report, null, '\t'));
        console.log('Lets predict XOR values');

        [0,1].forEach(function(a){
            [0,1].forEach(function(b){
                var prediction = svm.predict([a, b]);
                console.log("%d XOR %d => %d", a, b, prediction);
            });
        });
        process.exit(0);
    });

    svm.train(xorProblem);
}