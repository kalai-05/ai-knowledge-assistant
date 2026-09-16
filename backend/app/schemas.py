from pydantic import BaseModel


class QuestionRequest(BaseModel):
    question: str
    document_id: int | None = None


class QuestionResponse(BaseModel):
    answer: str
    sources: list[str]


class AgentQuestionRequest(BaseModel):
    question: str
    document_id: int


class AgentQuestionResponse(BaseModel):
    answer: str
    tool_used: str
    tool_reason: str
    sources: list[str]