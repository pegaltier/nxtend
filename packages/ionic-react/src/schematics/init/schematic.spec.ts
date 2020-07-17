import * as ngSchematics from '@angular-devkit/schematics';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readJsonInTree } from '@nrwl/workspace';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

describe('init', () => {
  let appTree: Tree;

  const testRunner = new SchematicTestRunner(
    '@nxtend/ionic-react',
    join(__dirname, '../../../collection.json')
  );

  testRunner.registerCollection(
    '@nxtend/capacitor',
    join(__dirname, '../../../../capacitor/collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
    appTree.overwrite(
      'package.json',
      `
      {
        "name": "test-name",
        "dependencies": {},
        "devDependencies": {
          "@nrwl/workspace": "0.0.0"
        }
      }
    `
    );
  });

  it('should add Ionic React dependencies', async () => {
    const result = await testRunner
      .runSchematicAsync('init', {}, appTree)
      .toPromise();
    const packageJson = readJsonInTree(result, 'package.json');

    expect(packageJson.dependencies['@ionic/react']).toBeDefined();
    expect(packageJson.dependencies['ionicons']).toBeDefined();
    expect(
      packageJson.devDependencies['@testing-library/user-event']
    ).toBeDefined();
    expect(
      packageJson.devDependencies['@testing-library/jest-dom']
    ).toBeDefined();
  });

  it('should add and initialize Nrwl React plugin', async () => {
    const result = await testRunner
      .runSchematicAsync('init', {}, appTree)
      .toPromise();
    const packageJson = readJsonInTree(result, 'package.json');

    expect(packageJson.devDependencies['@nrwl/react']).toBeDefined();
    expect(packageJson.devDependencies['@nrwl/react']).toEqual('0.0.0');

    expect(packageJson.dependencies['react']).toBeDefined();
    expect(packageJson.dependencies['react-dom']).toBeDefined();
  });

  it('should add and initialize nxtend Capacitor plugin', async () => {
    const result = await testRunner
      .runSchematicAsync('init', { capacitor: true }, appTree)
      .toPromise();
    const packageJson = readJsonInTree(result, 'package.json');

    expect(packageJson.devDependencies['@nxtend/capacitor']).toBeDefined();
    expect(packageJson.devDependencies['@nxtend/capacitor']).not.toEqual('*');

    expect(packageJson.dependencies['@capacitor/core']).toBeDefined();
    expect(packageJson.devDependencies['@capacitor/cli']).toBeDefined();
  });

  it('should throw an error if Nrwl Workspace plugin is not installed', async () => {
    appTree.overwrite(
      'package.json',
      `
      {
        "name": "test-name",
        "dependencies": {},
        "devDependencies": {}
      }
    `
    );
    await expect(
      testRunner.runSchematicAsync('init', {}, appTree).toPromise()
    ).rejects.toThrowError();
  });

  it('should set default collection', async () => {
    const result = await testRunner
      .runSchematicAsync('init', {}, appTree)
      .toPromise();
    const workspaceJson = readJsonInTree(result, 'workspace.json');

    expect(workspaceJson.cli.defaultCollection).toEqual('@nxtend/ionic-react');
  });

  describe('external schematics', () => {
    it('should call the @nxtend/capacitor:init schematic', async () => {
      const externalSchematicSpy = jest.spyOn(
        ngSchematics,
        'externalSchematic'
      );
      await testRunner
        .runSchematicAsync('init', { capacitor: true }, appTree)
        .toPromise();

      expect(externalSchematicSpy).toBeCalledWith(
        '@nxtend/capacitor',
        'init',
        expect.objectContaining({})
      );
    });
  });
});