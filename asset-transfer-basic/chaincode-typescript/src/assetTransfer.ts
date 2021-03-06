/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Asset } from './asset';

export class AssetTransfer extends Contract {

    public async initLedger(ctx: Context) {
        const assets: Asset[] = [
            {
                ID: "asset1",
                Color: "blue",
                Size: 5,
                Owner: "Tomoko",
                AppraisedValue: 300,
            },
            {
                ID: "asset2",
                Color: "red",
                Size: 5,
                Owner: "Brad",
                AppraisedValue: 400,
            },
            {
                ID: "asset3",
                Color: "green",
                Size: 10,
                Owner: "Jin Soo",
                AppraisedValue: 500,
            },
            {
                ID: "asset4",
                Color: "yellow",
                Size: 10,
                Owner: "Max",
                AppraisedValue: 600,
            },
            {
                ID: "asset5",
                Color: "black",
                Size: 15,
                Owner: "Adriana",
                AppraisedValue: 700,
            },
            {
                ID: "asset6",
                Color: "white",
                Size: 15,
                Owner: "Michel",
                AppraisedValue: 800,
            },
        ];

        for (let i = 0; i < assets.length; i++) {
            assets[i].docType = 'asset';
            await ctx.stub.putState(assets[i].ID, Buffer.from(JSON.stringify(assets[i])));
            console.info('Added <--> ', assets[i]);
        }
    }

    // createAsset issues a new asset to the world state with given details.
    public async createAsset(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number) {
        const asset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // readAsset returns the asset stored in the world state with given id.
    public async readAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }

        return assetJSON.toString();
    }

    // updateAsset updates an existing asset in the world state with provided parameters.
    public async updateAsset(ctx: Context, id: string, color: string, size: number, owner: string, appraisedValue: number) {
        const exists = await this.assetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwritting original asset with new asset
        let updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // deleteAsset deletes an given asset from the world state.
    public async deleteAsset(ctx: Context, id: string) {
        const exists = await this.assetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        return ctx.stub.deleteState(id);
    }

    // assetExists returns true when asset with given ID exists in world state.
    public async assetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            return false;
        }
        return true;
    }

    // transferAsset updates the owner field of asset with given id in the world state.
    public async transferAsset(ctx: Context, id: string, newOwner: string) {
        let assetString = await this.readAsset(ctx, id);

        let asset = JSON.parse(assetString);
        asset.Owner = newOwner;

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // getAllAssets returns all assets found in the world state.
    public async getAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        for await (const { key, value } of ctx.stub.getStateByRange("", "")) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

}
