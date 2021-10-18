import * as vs from "vscode";
import * as as from "../../shared/analysis_server_types";
import { disposeAll } from "../../shared/utils";
import { fsPath } from "../../shared/utils/fs";
import * as util from "../utils";
import { DasAnalyzerClient } from "./analyzer_das";

export class FileChangeHandler implements vs.Disposable {
	private readonly disposables: vs.Disposable[] = [];
	private readonly filesWarnedAbout = new Set<string>();
	constructor(private readonly analyzer: DasAnalyzerClient) {
		this.disposables.push(
			vs.workspace.onDidChangeTextDocument((e) => this.onDidChangeTextDocument(e)),
		);
	}

	public onDidChangeTextDocument(e: vs.TextDocumentChangeEvent) {
		if (!util.isAnalyzable(e.document))
			return;

		if (e.contentChanges.length === 0) // This event fires for metadata changes (dirty?) so don't need to notify AS then.
			return;

		const files: { [key: string]: as.AddContentOverlay } = {};

		files[fsPath(e.document.uri)] = {
			content: e.document.getText(),
			type: "add",
		};

		// tslint:disable-next-line: no-floating-promises
		this.analyzer.analysisUpdateContent({ files });
	}

	public dispose(): any {
		disposeAll(this.disposables);
	}
}
