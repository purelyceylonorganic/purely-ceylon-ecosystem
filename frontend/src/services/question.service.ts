import api from "../api/axios";

export const questionService = {

  async askQuestion(
    productId: string,
    question: string
  ) {
    const response = await api.post(
      `/questions/${productId}`,
      {
        question,
      }
    );

    return response.data;
  },

  async getQuestions(
    productId: string
  ) {
    const response = await api.get(
      `/questions/${productId}`
    );

    return response.data;
  },

  async answerQuestion(
    id: string,
    answer: string
  ) {
    const response = await api.put(
      `/questions/answer/${id}`,
      {
        answer,
      }
    );

    return response.data;
  },

  async deleteQuestion(id: string) {
    const response = await api.delete(
      `/questions/${id}`
    );

    return response.data;
  },

};