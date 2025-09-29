describe("example", () => {
  it("body should exist", async () => {
    const body = $("body");
    await expect(body).toExist();
  });
});
