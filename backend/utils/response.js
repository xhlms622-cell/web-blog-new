class ApiResponse {
  static success(data = null, message = '操作成功') {
    return {
      code: 200,
      message,
      data
    };
  }

  static error(message = '操作失败', code = 400, errors = null) {
    const response = {
      code,
      message
    };
    if (errors) {
      response.errors = errors;
    }
    return response;
  }

  static paginate(list, page, pageSize, total) {
    return {
      code: 200,
      message: '操作成功',
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    };
  }
}

module.exports = ApiResponse;
