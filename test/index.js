const assert = require("assert");
const fizzbuzz = require("../index");

describe("function(fizzbuzz)", () => {
  it("returns FizzBuzz when value is devisible by 15", () => {
    assert(fizzbuzz(30) === "FizzBuzz")
  });

  it("returns Fizz when value is devisible by 9", () => {
    assert(fizzbuzz(9) === "Fizz")
  });

  it("returns Buzz when value is devisible by 5", () => {
    assert(fizzbuzz(5) === "Buzz")
  });

  it("returns the value when value is not devisible by 3 or 5", () => {
    assert(fizzbuzz(7) === "7")
  });
});
