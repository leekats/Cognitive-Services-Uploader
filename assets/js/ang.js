var app = angular.module('incognitive', []);
app.controller('ctr', function ($scope, $http) {

    $scope.imgInput;
    $scope.text = "";

    $scope.showImage = function () {
        if ($scope.imgInput != undefined && $scope.imgInput.includes(".")) {
            var temp = $scope.imgInput.split(".");
            if (temp[temp.length - 1].length < 6) {
                return $scope.imgInput;
            }
        }
        return "";
    }

    $scope.doMagic = function () {
        $http({
            url: '/detect',
            method: "POST",
            data: { 'ur': $scope.imgInput }
        }).then(function (data) {$scope.text = data.data;})
    }
});