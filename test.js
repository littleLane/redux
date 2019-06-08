var moveZeroes = function(nums) {
  for (let i = 0, len = nums.length; i < len; i += 1) {
    debugger
    if (nums[i] === 0) {
      nums.splice(i, 1)
      nums.push(0)
      i--
    }
  }

  return nums
};

console.log(moveZeroes([0,1,0,3,12]))
