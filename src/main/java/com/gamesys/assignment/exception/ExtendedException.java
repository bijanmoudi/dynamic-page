package com.gamesys.assignment.exception;

public class ExtendedException extends Exception {

	private final ErrorCode code;

	public ExtendedException(ErrorCode code) {
		super(code.getMessage());
		this.code = code;
	}

	public ExtendedException(ErrorCode code, Throwable cause) {
		super(code.getMessage(), cause);
		this.code = code;
	}

	public ErrorCode getError() {
		return code;
	}

	public int getCode() {
		return code.getCode();
	}

	@Override
	public String getMessage() {
		return code.getMessage();
	}

}