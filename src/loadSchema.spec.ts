// Must be imported before loadSchema.
import shell from "./mocks/shelljs";

import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { getIntrospectionQuery } from "graphql";
import { slow, suite, test, timeout } from "mocha-typescript";
import mock from "mock-fs";
import nock from "nock";
import td from "testdouble";
import { loadSchema } from "./loadSchema";
import exampleSchema from "./resources/exampleSchema.json";

chaiUse(chaiAsPromised);

// tslint:disable:no-unsafe-any
// tslint:disable:no-unused-expression

/**
 * Tests for the Environment.
 */
@suite(timeout(300), slow(50))
export class LoadSchemaSpec {
  private nockScope: nock.Scope;

  public after(): void {
    mock.restore();
    td.reset();

    if (this.nockScope != null) {
      this.nockScope.done();
    }
  }

  @test("load schema from glob pattern")
  public async loadGlobPattern(): Promise<void> {
    mock({
      "src/path": {
        "product.graphql": "type Product { uuid: String! name: String! }",
        "user.graphql": "type User { firstname: String! lastname: String! }",
      },
    });

    const schema = await loadSchema({ glob: "src/**/*.graphql" });
    const user = schema.getType("User");
    const product = schema.getType("Product");

    expect(user).not.to.be.undefined;
    expect(product).not.to.be.undefined;
  }

  @test("check for presence of git")
  public async checkForGit(): Promise<void> {
    const committish = "master";
    const glob = "src/**/*.graphql";

    td.when(shell.which("git")).thenReturn(false);

    await expect(loadSchema({ committish, glob })).to.eventually.be.rejectedWith("Sorry, this script requires git");
  }

  @test("load schema from committish:glob pattern")
  public async loadCommittishGlobPattern(): Promise<void> {
    const committish = "master";
    const glob = "src/**/*.graphql";

    td.when(shell.which("git")).thenReturn(true);

    td.when(
      shell.exec(`for file in $(git ls-tree ${committish} -r --name-only ${glob}); `
        + `do git show ${committish}:$file; echo '';`
        + "done;",
        { silent: true },
      ),
    )
    .thenReturn({
      code: 0,
      stderr: "",
      stdout: `type Product { uuid: String! name: String! }

      type User { firstname: String! lastname: String! }
      `,
    });

    const schema = await loadSchema({ committish, glob });
    const user = schema.getType("User");
    const product = schema.getType("Product");

    expect(user).not.to.be.undefined;
    expect(product).not.to.be.undefined;
  }

  @test("load schema by introspecting url")
  public async introspectUrl(): Promise<void> {
    this.nockScope = nock("http://example.com")
      .post("/graphql", {
        query: getIntrospectionQuery(),
      })
      .reply(200, exampleSchema);

    const schema = await loadSchema({ url: "http://example.com/graphql" });
    const profile = schema.getType("Profile");

    expect(profile).not.to.be.undefined;
  }
}
